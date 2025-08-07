const express = require('express');
const {
  getAllOrdersController,
  getOrderStatsController,
  updateOrderStatusController,
  getOrderByIdController,
  deleteOrderController
} = require('../controllers/orders.controller');

const router = express.Router();

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filtering
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Server error
 */
router.get('/', getAllOrdersController);

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin Orders]
 *     responses:
 *       200:
 *         description: Order statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', getOrderStatsController);

/**
 * @swagger
 * /api/admin/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/:orderId/status', updateOrderStatusController);

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:orderId', getOrderByIdController);

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   delete:
 *     summary: Delete order by ID
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.delete('/:orderId', deleteOrderController);

module.exports = router; 