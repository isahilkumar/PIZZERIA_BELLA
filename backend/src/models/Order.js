const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['custom', 'variety'],
    default: 'custom',
  },
  name: {
    type: String,
    required: true,
  },
  base: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  sauce: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  cheese: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  veggies: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: { type: String },
      price: { type: Number, default: 0 },
    },
  ],
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  itemTotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true, default: 0 },
      deliveryFee: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    payment: {
      method: { type: String, default: 'razorpay' },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      paidAt: { type: Date },
    },
    estimatedDeliveryTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);

