const express = require('express');
const { loginCustomerController, getCustomerProfileController } = require('../controller/auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customer Auth
 *   description: Authentication endpoints for customers
 */

/**
 * @swagger
 * /api/customer/auth/login:
 *   post:
 *     summary: Customer login
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, password]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "0100000000"
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful, returns JWT and user info
 *       400:
 *         description: Missing phone number or password
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: customer not found
 *       500:
 *         description: Internal server error
 */

router.post('/login', loginCustomerController);

/**
 * @swagger
 * /api/customer/auth/profile:
 *   get:
 *     summary: Get authenticated customer profile
 *     tags: [Customer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.get('/profile', authenticate, getCustomerProfileController);

module.exports = router; 