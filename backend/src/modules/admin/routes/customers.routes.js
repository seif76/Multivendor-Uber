const express = require('express');
const router = express.Router();
const upload = require('../../../middlewares/uploadLocal');
const {
  getAllCustomersController,
  registerCustomerController,
  getCustomerByIdController,
  getCustomerOrdersController,
  updateCustomerStatusController,
  deleteCustomerController,
  getCustomerStatsController
} = require('../controllers/customers.controller');

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Admin Customers]
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
 *         description: Number of customers per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Deactivated]
 *         description: Filter by customer status
 *     responses:
 *       200:
 *         description: List of customers
 *       500:
 *         description: Server error
 */
router.get('/', getAllCustomersController);

/**
 * @swagger
 * /api/admin/customers/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Admin Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, customer_status]
 *             properties:
 *               phone_number:
 *                 type: string
 *               customer_status:
 *                 type: string
 *                 enum: [Active, Deactivated]
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/register', upload.single('profile_photo'), registerCustomerController);

/**
 * @swagger
 * /api/admin/customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Admin Customers]
 *     responses:
 *       200:
 *         description: Customer statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', getCustomerStatsController);

/**
 * @swagger
 * /api/admin/customers/details:
 *   get:
 *     summary: Get customer details by phone number
 *     tags: [Admin Customers]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get('/:customerId', getCustomerByIdController);

/**
 * @swagger
 * /api/admin/customers/:customerId/orders:
 *   get:
 *     summary: Get customer orders
 *     tags: [Admin Customers]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: List of customer orders
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get('/:customerId/orders', getCustomerOrdersController);

/**
 * @swagger
 * /api/admin/customers/status:
 *   put:
 *     summary: Update customer status
 *     tags: [Admin Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, customer_status]
 *             properties:
 *               phone_number:
 *                 type: string
 *               customer_status:
 *                 type: string
 *                 enum: [Active, Deactivated]
 *     responses:
 *       200:
 *         description: Customer status updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/:customerId/status', updateCustomerStatusController);

/**
 * @swagger
 * /api/admin/customers/delete:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Admin Customers]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.delete('/:customerId', deleteCustomerController);

module.exports = router; 