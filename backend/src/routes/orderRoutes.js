const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Customer Order Endpoints
router.post('/create', protect, orderController.createOrder);
router.post('/verify-payment', protect, orderController.verifyPayment);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

// Admin Order Endpoints
router.get('/admin/all', protect, adminOnly, orderController.getAllOrdersAdmin);
router.put('/admin/:id/status', protect, adminOnly, orderController.updateOrderStatusAdmin);

module.exports = router;

