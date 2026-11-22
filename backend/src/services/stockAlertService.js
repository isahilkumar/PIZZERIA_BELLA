const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const { sendLowStockAlertEmail } = require('../utils/mailer');

let cronTask = null;
let lastAlertSentAt = null;
let lastAlertItems = [];

/**
 * Checks all inventory items and sends an email alert to admin if any item is below threshold
 * @param {boolean} forceSend - Whether to send email even if previously alerted
 */
const checkStockAndNotify = async (forceSend = false) => {
  try {
    const items = await InventoryItem.find({ isActive: true });
    const lowStockItems = items.filter((item) => item.stockQuantity < item.threshold);

    if (lowStockItems.length === 0) {
      return {
        hasLowStock: false,
        count: 0,
        lowStockItems: [],
        message: 'All inventory items are above their safety threshold.',
      };
    }

    console.log(`⚠️ [StockAlert] Found ${lowStockItems.length} item(s) below threshold:`);
    lowStockItems.forEach((item) => {
      console.log(`  - ${item.name} (${item.category}): ${item.stockQuantity} / ${item.threshold} threshold`);
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com';
    const emailResult = await sendLowStockAlertEmail(adminEmail, lowStockItems);

    lastAlertSentAt = new Date();
    lastAlertItems = lowStockItems.map((i) => ({
      id: i._id,
      name: i.name,
      category: i.category,
      stockQuantity: i.stockQuantity,
      threshold: i.threshold,
    }));

    return {
      hasLowStock: true,
      count: lowStockItems.length,
      lowStockItems,
      emailResult,
      lastAlertSentAt,
      message: `Stock alert email dispatched to ${adminEmail} for ${lowStockItems.length} items.`,
    };
  } catch (error) {
    console.error('❌ Error in checkStockAndNotify:', error.message);
    throw error;
  }
};

/**
 * Initializes the node-cron scheduled job for automated stock notifications
 */
const initStockCron = () => {
  const schedule = process.env.CRON_SCHEDULE || '*/15 * * * *'; // Default every 15 mins

  if (cronTask) {
    cronTask.stop();
  }

  cronTask = cron.schedule(schedule, async () => {
    console.log(`⏰ [Node-Cron] Running scheduled inventory stock check (${new Date().toLocaleTimeString()})...`);
    try {
      await checkStockAndNotify(false);
    } catch (err) {
      console.error('❌ Error executing scheduled stock check:', err.message);
    }
  });

  console.log(`⏱️ Stock Alert Cron job initialized with schedule: "${schedule}"`);
};

module.exports = {
  checkStockAndNotify,
  initStockCron,
  getLastAlertStatus: () => ({
    lastAlertSentAt,
    lastAlertItems,
  }),
};

