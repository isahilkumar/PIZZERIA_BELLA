const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public / User read-only access (for pizza builder)
router.get('/', inventoryController.getInventory);

// Admin-only Inventory Management
router.post('/', protect, adminOnly, inventoryController.createInventoryItem);
router.put('/:id', protect, adminOnly, inventoryController.updateInventoryItem);
router.post('/check-alerts', protect, adminOnly, inventoryController.triggerStockCheck);
router.get('/alert-status', protect, adminOnly, inventoryController.getAlertStatus);

module.exports = router;

