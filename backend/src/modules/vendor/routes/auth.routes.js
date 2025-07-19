const express = require('express');
const { loginVendorController } = require('../controllers/auth.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendor Auth
 *   description: Authentication endpoints for vendors
 */


/**
 * @swagger
 * /api/vendor/auth/login:
 *   post:
 *     summary: Vendor login
 *     tags: [Vendor Auth]
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
 *         description: vendor not found
 *       500:
 *         description: Internal server error
 */



router.post('/login', loginVendorController);
//router.post('/register', registerCaptainController);

module.exports = router;
