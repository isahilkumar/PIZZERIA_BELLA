const InventoryItem = require('../models/InventoryItem');
const { checkStockAndNotify, getLastAlertStatus } = require('../services/stockAlertService');
const { getRecentEmails } = require('../utils/mailer');

// 1. Get all inventory items (public or authenticated)
// Categorized or flat list
exports.getInventory = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const items = await InventoryItem.find(filter).sort({ category: 1, name: 1 });

    // Grouping by category for easy consumption by pizza builder or admin panels
    const grouped = {
      base: items.filter((i) => i.category === 'base'),
      sauce: items.filter((i) => i.category === 'sauce'),
      cheese: items.filter((i) => i.category === 'cheese'),
      veggie: items.filter((i) => i.category === 'veggie'),
    };

    res.status(200).json({
      success: true,
      count: items.length,
      items,
      grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inventory',
    });
  }
};

// 2. Update stock quantity or details manually (Admin only)
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, stockQuantity, threshold, price, isActive, badge, description } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    if (name !== undefined) item.name = name;
    if (stockQuantity !== undefined) item.stockQuantity = Math.max(0, Number(stockQuantity));
    if (threshold !== undefined) item.threshold = Math.max(1, Number(threshold));
    if (price !== undefined) item.price = Math.max(0, Number(price));
    if (isActive !== undefined) item.isActive = isActive;
    if (badge !== undefined) item.badge = badge;
    if (description !== undefined) item.description = description;

    await item.save();

    // Check if updating this item dropped it below threshold
    if (item.stockQuantity < item.threshold) {
      // Trigger background check/alert
      checkStockAndNotify(false).catch((e) => console.error('Alert err:', e.message));
    }

    res.status(200).json({
      success: true,
      message: `Updated ${item.name} stock to ${item.stockQuantity}`,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update inventory item',
    });
  }
};

// 3. Create a new inventory item (Admin only)
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, description, price, stockQuantity, threshold, unit, badge } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required',
      });
    }

    const item = await InventoryItem.create({
      name,
      category,
      description: description || '',
      price: price || 0,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 50,
      threshold: threshold !== undefined ? Number(threshold) : 20,
      unit: unit || 'units',
      badge: badge || '',
    });

    res.status(201).json({
      success: true,
      message: 'New inventory item created successfully',
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create inventory item',
    });
  }
};

// 4. Manually trigger stock threshold check and dispatch email (Admin only)
exports.triggerStockCheck = async (req, res) => {
  try {
    const result = await checkStockAndNotify(true);
    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger stock check',
    });
  }
};

// 5. Get recent alert status and emails log (Admin only)
exports.getAlertStatus = async (req, res) => {
  try {
    const alertStatus = getLastAlertStatus();
    const emails = getRecentEmails();
    res.status(200).json({
      success: true,
      alertStatus,
      recentEmails: emails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get alert status',
    });
  }
};

