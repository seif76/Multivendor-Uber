const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const {
  getVendorOrdersController,
  getVendorOrderDetailsController,
  updateOrderStatusController,
} = require('../controllers/order.controller');

const router = express.Router();

// Get all orders for the authenticated vendor
router.get('/', authenticate, getVendorOrdersController);

// Get order details for the authenticated vendor
router.get('/:orderId', authenticate, getVendorOrderDetailsController);

// Update order status (confirmed, shipped, delivered, etc.)
router.put('/:orderId/status', authenticate, updateOrderStatusController);

module.exports = router; 