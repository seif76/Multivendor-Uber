const express = require('express');
const { loginDeliverymanController, checkCustomerStatus } = require('../controllers/auth.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliveryman Auth
 *   description: Authentication endpoints for deliverymen
 */

/**
 * @swagger
 * /api/deliveryman/auth/login:
 *   post:
 *     summary: Deliveryman login
 *     tags: [Deliveryman Auth]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     deliveryman_status:
 *                       type: string
 *       400:
 *         description: Missing phone number or password
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: Deliveryman not found
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginDeliverymanController);

router.post('/check-customer-status', checkCustomerStatus);


module.exports = router;
