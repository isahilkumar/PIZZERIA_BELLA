const nodemailer = require('nodemailer');

let transporter = null;
const recentEmails = []; // Store the latest sent emails for testing/preview

const getTransporter = async () => {
  if (transporter) return transporter;

  const service = process.env.EMAIL_SERVICE ? process.env.EMAIL_SERVICE.trim().toLowerCase() : '';

  // 1. Preconfigured Email Service (e.g. Gmail, Outlook, Yahoo)
  if (service && service !== 'ethereal' && service !== 'mock' && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`📧 Configured ${service.toUpperCase()} Nodemailer transporter (${process.env.SMTP_USER})`);
    return transporter;
  }

  // 2. Custom SMTP Server (Host, Port, User, Pass)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`📧 Configured custom SMTP Nodemailer transporter (${process.env.SMTP_HOST}:${port})`);
    return transporter;
  }

  // 3. Fallback to automated Ethereal test account for instant development/sandbox email preview
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Created Ethereal test account with Nodemailer: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn(`⚠️ Could not create Ethereal account, falling back to mock transport:`, err.message);
    transporter = {
      sendMail: async (options) => {
        console.log(`[MOCK EMAIL SENT] To: ${options.to} | Subject: ${options.subject}`);
        return { messageId: 'mock-' + Date.now() };
      },
    };
    return transporter;
  }
};

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const mailClient = await getTransporter();
    const from = process.env.SMTP_FROM || '"Pizzeria Bella" <no-reply@pizzadelivery.com>';

    const info = await mailClient.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    let previewUrl = null;
    if (typeof nodemailer.getTestMessageUrl === 'function') {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📨 Email Preview URL: ${previewUrl}`);
      }
    }

    const emailRecord = {
      id: info.messageId,
      to,
      subject,
      timestamp: new Date().toISOString(),
      previewUrl,
    };
    recentEmails.unshift(emailRecord);
    if (recentEmails.length > 50) recentEmails.pop();

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// 1. Send Email Verification
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #44403c;">
      <div style="background: linear-gradient(135deg, #b71c1c, #d97706); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍕 Pizzeria Bella</h1>
        <p style="color: #fef3c7; margin: 4px 0 0; font-size: 15px;">Artisanal Oven-Baked Goodness</p>
      </div>
      <div style="padding: 28px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Welcome, ${user.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #d6d3d1;">
          Thank you for joining Pizzeria Bella. Please verify your email address to activate your account and start crafting delicious custom pizzas.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #f59e0b; color: #1c1917; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify My Email
          </a>
        </div>
        <p style="font-size: 13px; color: #a8a29e; word-break: break-all;">
          Or copy and paste this link in your browser:<br/>
          <a href="${verifyUrl}" style="color: #f59e0b;">${verifyUrl}</a>
        </p>
        <p style="font-size: 12px; color: #78716c; margin-top: 24px; border-top: 1px solid #292524; padding-top: 16px;">
          This verification link will expire in 24 hours. If you did not create this account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: '🍕 Verify your Pizzeria Bella account',
    html,
  });
};

// 2. Send Forgot Password Reset Link
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #44403c;">
      <div style="background: linear-gradient(135deg, #b71c1c, #d97706); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍕 Pizzeria Bella</h1>
        <p style="color: #fef3c7; margin: 4px 0 0; font-size: 15px;">Password Reset Request</p>
      </div>
      <div style="padding: 28px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Hello, ${user.name}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #d6d3d1;">
          We received a request to reset your Pizzeria Bella account password. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #e53935; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #a8a29e; word-break: break-all;">
          Or copy and paste this link in your browser:<br/>
          <a href="${resetUrl}" style="color: #f59e0b;">${resetUrl}</a>
        </p>
        <p style="font-size: 12px; color: #78716c; margin-top: 24px; border-top: 1px solid #292524; padding-top: 16px;">
          This link will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: '🔑 Reset your Pizzeria Bella password',
    html,
  });
};

// 3. Send Low-Stock Admin Notification
const sendLowStockAlertEmail = async (adminEmail, lowStockItems) => {
  const itemsHtml = lowStockItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #44403c;">
        <td style="padding: 10px; color: #fafaf9; font-weight: bold;">${item.name}</td>
        <td style="padding: 10px; text-transform: capitalize; color: #d6d3d1;">${item.category}</td>
        <td style="padding: 10px; color: ${item.stockQuantity === 0 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
          ${item.stockQuantity} ${item.unit || 'units'}
        </td>
        <td style="padding: 10px; color: #a8a29e;">${item.threshold} units</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #dc2626;">
      <div style="background: #991b1b; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚠️ Low Stock Inventory Alert</h1>
        <p style="color: #fecaca; margin: 4px 0 0; font-size: 14px;">Automated Notification from Pizzeria Bella Kitchen Inventory</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px; color: #e7e5e4;">
          The automated stock monitoring system has detected that the following <strong>${lowStockItems.length}</strong> inventory item(s) have fallen below their configured safety thresholds:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; text-align: left;">
          <thead>
            <tr style="background: #292524; color: #f59e0b;">
              <th style="padding: 10px;">Item Name</th>
              <th style="padding: 10px;">Category</th>
              <th style="padding: 10px;">Current Stock</th>
              <th style="padding: 10px;">Threshold</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="font-size: 14px; color: #d6d3d1;">
          Please log into the Admin Dashboard to restock these items promptly to prevent ordering interruptions.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="background: #f59e0b; color: #1c1917; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            Open Inventory Dashboard
          </a>
        </div>
        <p style="font-size: 12px; color: #78716c; margin-top: 20px; border-top: 1px solid #292524; padding-top: 12px;">
          Generated automatically by Node-Cron scheduled inventory monitor on ${new Date().toLocaleString()}.
        </p>
      </div>
    </div>
  `;

  return sendMail({
    to: adminEmail || process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com',
    subject: `🚨 [Action Required] Low Stock Alert: ${lowStockItems.length} ingredient(s) below threshold`,
    html,
  });
};

// 4. Send Order Confirmation Email
const sendOrderConfirmationEmail = async (order) => {
  const itemsList = order.items
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <strong>${item.name}</strong> x ${item.quantity} (₹${item.itemTotal})
        <div style="font-size: 12px; color: #a8a29e;">
          Base: ${item.base.name} | Sauce: ${item.sauce.name} | Cheese: ${item.cheese.name}
          ${item.veggies && item.veggies.length > 0 ? `<br/>Veggies: ${item.veggies.map((v) => v.name).join(', ')}` : ''}
        </div>
      </li>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #44403c;">
      <div style="background: linear-gradient(135deg, #15803d, #047857); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🎉 Order Confirmed!</h1>
        <p style="color: #d1fae5; margin: 4px 0 0; font-size: 15px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 24px;">
        <h3 style="color: #f59e0b; margin-top: 0;">Hi ${order.customer.name},</h3>
        <p style="font-size: 15px; color: #d6d3d1;">
          We've received your payment of <strong>₹${order.pricing.total}</strong> and our pizzaiolos are getting the stone oven fired up!
        </p>
        <h4 style="color: #fafaf9; border-bottom: 1px solid #44403c; padding-bottom: 6px;">Order Details:</h4>
        <ul style="color: #e7e5e4; padding-left: 20px;">
          ${itemsList}
        </ul>
        <div style="background: #292524; padding: 14px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Delivery Address:</strong> ${order.customer.address.street}, ${order.customer.address.city} - ${order.customer.address.pincode}</p>
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Current Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${order.status}</span></p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order._id}" style="background: #f59e0b; color: #1c1917; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Track Your Pizza Live 🛵
          </a>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: order.customer.email,
    subject: `🍕 Order Confirmed! #${order.orderNumber} - Pizzeria Bella`,
    html,
  });
};

// 5. Send Admin New Order Alert Email
const sendAdminNewOrderNotification = async (order) => {
  const targetAdminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'kumarsahil4447@gmail.com';
  const itemsList = order.items
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <strong>${item.name}</strong> x ${item.quantity} (₹${item.itemTotal})
        <div style="font-size: 12px; color: #a8a29e;">
          Base: ${item.base?.name || 'Hand Tossed'} | Sauce: ${item.sauce?.name || 'Classic'} | Cheese: ${item.cheese?.name || 'Mozzarella'}
          ${item.veggies && item.veggies.length > 0 ? `<br/>Veggies: ${item.veggies.map((v) => v.name).join(', ')}` : ''}
        </div>
      </li>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #f97316;">
      <div style="background: linear-gradient(135deg, #f43f5e, #ea580c, #f59e0b); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🔔 New Order Received!</h1>
        <p style="color: #fef3c7; margin: 4px 0 0; font-size: 15px; font-weight: bold;">Order #${order.orderNumber} • ₹${order.pricing.total}</p>
      </div>
      <div style="padding: 24px;">
        <h3 style="color: #f59e0b; margin-top: 0;">Kitchen Dispatch Alert</h3>
        <p style="font-size: 15px; color: #d6d3d1;">
          A new verified payment order has been placed by <strong>${order.customer.name}</strong>.
        </p>
        <div style="background: #292524; padding: 14px; border-radius: 8px; margin: 16px 0; border: 1px solid #44403c;">
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Customer Phone:</strong> <a href="tel:${order.customer.phone}" style="color: #f59e0b;">${order.customer.phone}</a></p>
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Customer Email:</strong> ${order.customer.email}</p>
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Delivery Address:</strong> ${order.customer.address.street}, ${order.customer.address.city} - ${order.customer.address.pincode}</p>
          <p style="margin: 4px 0; color: #d6d3d1;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID (Razorpay)</span></p>
        </div>
        <h4 style="color: #fafaf9; border-bottom: 1px solid #44403c; padding-bottom: 6px;">Pizzas to Bake:</h4>
        <ul style="color: #e7e5e4; padding-left: 20px;">
          ${itemsList}
        </ul>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" style="background: #f59e0b; color: #1c1917; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            Open Kitchen Orders Panel 👨‍🍳
          </a>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: targetAdminEmail,
    subject: `🔔 [New Order Alert] #${order.orderNumber} (₹${order.pricing.total}) - ${order.customer.name}`,
    html,
  });
};

// 6. Send Order Status Update Email to Customer
const sendOrderStatusUpdateEmail = async (order, status, note) => {
  if (!order.customer || !order.customer.email) return;

  const statusIcons = {
    'Order Received': '📋',
    'In Kitchen': '👨‍🍳',
    'Sent to Delivery': '🛵',
    'Delivered': '🎉',
    'Cancelled': '❌',
  };

  const statusDescriptions = {
    'In Kitchen': 'Your artisanal pizza has entered the 900°F volcanic stone oven! Our master pizzaiolos are baking your sourdough to bubbling golden perfection.',
    'Sent to Delivery': 'Your fresh, hot pizza is packed and out on the road with our delivery driver. ETA: 10-15 minutes!',
    'Delivered': 'Your wood-fired pizza has been delivered! We hope you love every bite. Buon Appetito!',
    'Cancelled': 'Your order has been cancelled. If payment was deducted, a refund will be issued promptly.',
  };

  const icon = statusIcons[status] || '🍕';
  const desc = statusDescriptions[status] || `Your order status has been updated to "${status}".`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #44403c;">
      <div style="background: linear-gradient(135deg, #f43f5e, #ea580c, #f59e0b); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px;">${icon} Order Status Update</h1>
        <p style="color: #fef3c7; margin: 4px 0 0; font-size: 15px;">Order #${order.orderNumber}</p>
      </div>
      <div style="padding: 24px;">
        <h3 style="color: #f59e0b; margin-top: 0;">Hi ${order.customer.name},</h3>
        <div style="background: #292524; padding: 18px; border-radius: 10px; margin: 16px 0; border: 1px solid #44403c; text-align: center;">
          <span style="font-size: 12px; color: #a8a29e; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block;">Current Status</span>
          <span style="font-size: 22px; color: #f59e0b; font-weight: bold; margin-top: 4px; display: block;">${icon} ${status}</span>
        </div>
        <p style="font-size: 15px; color: #d6d3d1; line-height: 1.6;">
          ${desc}
        </p>
        ${note ? `<p style="font-size: 13px; color: #a8a29e; font-style: italic;">Kitchen Note: "${note}"</p>` : ''}
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order._id}" style="background: #f59e0b; color: #1c1917; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            Track Order Live 🛵
          </a>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: order.customer.email,
    subject: `${icon} [Order #${order.orderNumber}] Status Update: ${status}`,
    html,
  });
};

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlertEmail,
  sendOrderConfirmationEmail,
  sendAdminNewOrderNotification,
  sendOrderStatusUpdateEmail,
  getRecentEmails: () => recentEmails,
};

