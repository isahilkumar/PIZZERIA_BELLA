const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const { checkStockAndNotify } = require('../services/stockAlertService');
const {
  sendOrderConfirmationEmail,
  sendAdminNewOrderNotification,
  sendOrderStatusUpdateEmail,
} = require('../utils/mailer');

// Initialize Razorpay client
let razorpayClient = null;
try {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_custompizza123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'testkeysecretxyz789',
  });
} catch (e) {
  console.warn('⚠️ Razorpay client initialization error:', e.message);
}

// 1. Create Order & Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and delivery address are required' });
    }

    // Check inventory availability for all items
    for (const item of items) {
      const baseItem = await InventoryItem.findById(item.base.id);
      if (!baseItem || baseItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for crust: ${item.base.name} (${baseItem ? baseItem.stockQuantity : 0} left)`,
        });
      }

      const sauceItem = await InventoryItem.findById(item.sauce.id);
      if (!sauceItem || sauceItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for sauce: ${item.sauce.name} (${sauceItem ? sauceItem.stockQuantity : 0} left)`,
        });
      }

      const cheeseItem = await InventoryItem.findById(item.cheese.id);
      if (!cheeseItem || cheeseItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for cheese: ${item.cheese.name} (${cheeseItem ? cheeseItem.stockQuantity : 0} left)`,
        });
      }

      if (item.veggies && item.veggies.length > 0) {
        for (const v of item.veggies) {
          const vItem = await InventoryItem.findById(v.id);
          if (!vItem || vItem.stockQuantity < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for veggie: ${v.name} (${vItem ? vItem.stockQuantity : 0} left)`,
            });
          }
        }
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery over ₹500
    const total = subtotal + tax + deliveryFee;

    const orderNumber = 'PB-' + Math.floor(100000 + Math.random() * 900000);

    // Initial order record
    const order = new Order({
      orderNumber,
      user: req.user._id,
      customer: {
        name: customer.name,
        email: customer.email || req.user.email,
        phone: customer.phone,
        address: {
          street: customer.address.street || '',
          city: customer.address.city || '',
          pincode: customer.address.pincode || '',
        },
      },
      items,
      pricing: {
        subtotal,
        tax,
        deliveryFee,
        total,
      },
      status: 'Order Received',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: new Date(),
          note: 'Order placed, awaiting payment confirmation',
        },
      ],
      payment: {
        method: 'razorpay',
        status: 'pending',
      },
      estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000), // 35 minutes
    });

    // Check if configured with real Razorpay keys
    const isRealKey = Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_ID.startsWith('rzp_') &&
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_custompizza123' &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_SECRET !== 'testkeysecretxyz789'
    );

    // Create Razorpay Order
    let razorpayOrderId = 'order_test_' + Date.now();
    try {
      if (razorpayClient && isRealKey) {
        const rzpOrder = await razorpayClient.orders.create({
          amount: Math.round(total * 100), // paise
          currency: 'INR',
          receipt: orderNumber,
        });
        razorpayOrderId = rzpOrder.id;
      }
    } catch (rzpErr) {
      console.warn('⚠️ Razorpay API order creation warning, using test order ID:', rzpErr.message);
      razorpayOrderId = 'order_test_' + Date.now();
    }

    order.payment.razorpayOrderId = razorpayOrderId;
    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: total,
      amountPaise: Math.round(total * 100),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_custompizza123',
      isRealKey,
      customer: order.customer,
      items: order.items,
      pricing: order.pricing,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
};

// 2. Verify Payment & Decrement Inventory
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, testModeSuccess } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.payment.status === 'completed') {
      return res.status(200).json({ success: true, message: 'Order already completed', order });
    }

    let isValid = false;

    // Check if testModeSuccess was triggered (e.g. Razorpay test flow or Test Mode click)
    if (testModeSuccess) {
      isValid = true;
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature && process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === razorpaySignature;
    } else if (razorpayPaymentId) {
      // Test key checkout returns payment ID
      isValid = true;
    }

    if (!isValid) {
      order.payment.status = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment status
    order.payment.status = 'completed';
    order.payment.razorpayOrderId = razorpayOrderId || order.payment.razorpayOrderId;
    order.payment.razorpayPaymentId = razorpayPaymentId || 'pay_test_' + Date.now();
    order.payment.razorpaySignature = razorpaySignature || 'sig_verified_test';
    order.payment.paidAt = new Date();
    order.statusHistory.push({
      status: 'Order Received',
      timestamp: new Date(),
      note: 'Payment received via Razorpay (Test Mode). Order confirmed.',
    });

    await order.save();

    // DECREMENT INVENTORY FOR EACH INGREDIENT IN THE ORDER
    const itemsToDecrement = [];

    for (const item of order.items) {
      const qty = item.quantity || 1;
      if (item.base && item.base.id) itemsToDecrement.push({ id: item.base.id, qty });
      if (item.sauce && item.sauce.id) itemsToDecrement.push({ id: item.sauce.id, qty });
      if (item.cheese && item.cheese.id) itemsToDecrement.push({ id: item.cheese.id, qty });
      if (item.veggies && item.veggies.length > 0) {
        for (const v of item.veggies) {
          if (v.id) itemsToDecrement.push({ id: v.id, qty });
        }
      }
    }

    // Perform decrements
    for (const dec of itemsToDecrement) {
      await InventoryItem.findByIdAndUpdate(dec.id, {
        $inc: { stockQuantity: -dec.qty },
      });
    }

    // Automatically check if stock fell below threshold and send notification to admin!
    checkStockAndNotify(false).catch((err) =>
      console.error('Error checking stock after order:', err.message)
    );

    // Send confirmation email to customer
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error('Customer confirmation email error:', err.message)
    );

    // Send new order alert email to Kitchen Admin
    sendAdminNewOrderNotification(order).catch((err) =>
      console.error('Admin new order alert email error:', err.message)
    );

    // Emit Real-Time Socket Event
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', order);
      io.emit('new_incoming_order', order);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

// 3. Get User Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Single Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Allow owner or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Admin: Get All Orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Admin: Update Order Status
// Requirements: Order Received -> In Kitchen -> Sent to Delivery -> Delivered
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to "${status}" by kitchen admin`,
    });

    await order.save();

    // Broadcast Real-Time Socket Event to client tracking room and admin room
    const io = req.app.get('io');
    if (io) {
      console.log(`📡 Emitting order_status_updated for order ${order._id} -> Status: ${status}`);
      io.to(`order_${order._id}`).emit('order_status_updated', order);
      io.emit('order_status_updated_global', order);
    }

    // Send order status update email to customer
    sendOrderStatusUpdateEmail(order, status, note).catch((err) =>
      console.error('Customer order status email error:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

