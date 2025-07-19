const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const {
  createOrderController,
  getMyOrdersController,
  getOrderDetailsController,
  cancelOrderController,
} = require('../controller/order.controller');

const router = express.Router();

// Create a new order (checkout)
router.post('/', authenticate, createOrderController);

// Get all orders for the logged-in customer
router.get('/my', authenticate, getMyOrdersController);

// Get order details for the logged-in customer
router.get('/:orderId', authenticate, getOrderDetailsController);

// Cancel an order
router.delete('/:orderId/cancel', authenticate, cancelOrderController);

module.exports = router; 