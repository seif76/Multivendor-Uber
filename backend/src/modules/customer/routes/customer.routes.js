// const express = require('express');
// const { 
//     registerCustomerController,
//     getCustomerByPhoneController,
//     editCustomerController,
//     deleteCustomerController,
//     setCustomerStatusController,
//     getAllCustomersController,
//     getAllCustomersStatusCountsController,
    
//       } = require('../controller/customer.controller');

// const router = express.Router();

// router.post('/register', registerCustomerController);
// router.get('/get', getCustomerByPhoneController);
// router.put('/edit', editCustomerController);
// router.put('/status', setCustomerStatusController);


// // For Admin web dashboard
// router.get('/all', getAllCustomersController);
// router.delete('/delete', deleteCustomerController);
// router.get('/get-all-customers-status', getAllCustomersStatusCountsController);



// module.exports = router;

const express = require('express');
const {
  registerCustomerController,
  getCustomerByPhoneController,
  editCustomerController,
  deleteCustomerController,
  setCustomerStatusController,
  getAllCustomersController,
  getAllCustomersStatusCountsController,
} = require('../controller/customer.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: API endpoints for managing customers
 */

/**
 * @swagger
 * /api/customers/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone_number]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Seif Amir
 *               email:
 *                 type: string
 *                 example: seif@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               phone_number:
 *                 type: string
 *                 example: "0100000000"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               profile_photo:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       201:
 *         description: Customer registered successfully
 */
router.post('/register', registerCustomerController);

/**
 * @swagger
 * /api/customers/get:
 *   get:
 *     summary: Retrieve a customer by phone number
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Phone number of the customer
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 */
router.get('/get', getCustomerByPhoneController);

/**
 * @swagger
 * /api/customers/edit:
 *   put:
 *     summary: Update customer information
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, updates]
 *             properties:
 *               phone_number:
 *                 type: string
 *               updates:
 *                 type: object
 *                 description: Fields to update
 *                 example:
 *                   name: New Name
 *                   gender: female
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.put('/edit', editCustomerController);

/**
 * @swagger
 * /api/customers/status:
 *   put:
 *     summary: Change a customer's account status
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, status]
 *             properties:
 *               phone_number:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Deactivated]
 *     responses:
 *       200:
 *         description: Customer status updated
 */
router.put('/status', setCustomerStatusController);

/**
 * @swagger
 * /api/customers/all:
 *   get:
 *     summary: Get a paginated list of all customers
 *     tags: [Customers]
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
 *         description: Filter by customer status (Active, Deactivated)
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/all', getAllCustomersController);

/**
 * @swagger
 * /api/customers/get-all-customers-status:
 *   get:
 *     summary: Get counts of customers by status
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Count of total, active, and deactivated customers
 */
router.get('/get-all-customers-status', getAllCustomersStatusCountsController);

/**
 * @swagger
 * /api/customers/delete:
 *   delete:
 *     summary: Delete a customer using phone number
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number]
 *             properties:
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.delete('/delete', deleteCustomerController);

module.exports = router;
