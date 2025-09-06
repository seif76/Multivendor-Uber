const express = require('express');
const { loginVendorController, checkCustomerStatus } = require('../controllers/auth.controller');
const { registerVendorController, registerCustomerAsVendorController } = require('../controllers/vendor.controller');
const upload = require('../../../middlewares/uploadLocal');
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



/**
 * @swagger
 * /api/vendor/auth/register:
 *   post:
 *     summary: Vendor registration
 *     tags: [Vendor Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone_number, shop_name, shop_location, owner_name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               phone_number:
 *                 type: string
 *                 example: "0100000000"
 *               shop_name:
 *                 type: string
 *                 example: "John Doe's Shop"
 *               shop_location:
 *                 type: string
 *                 example: "123 Main St, Anytown, USA"
 *               owner_name:
 *                 type: string
 *                 example: "John Doe"
 *               passport_photo:
 *                 type: string
 *                 example: "passport.jpg"
 *               license_photo:
 *                 type: string
 *                 example: "license.jpg"
 *               shop_front_photo:
 *                 type: string
 *                 example: "shop_front.jpg"
 *               logo:
 *                 type: string
 *                 example: "logo.jpg"
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Missing required fields
 */
router.post(
  '/register',
  upload.fields([
    { name: 'passport_photo', maxCount: 1 },
    { name: 'license_photo', maxCount: 1 },
    { name: 'shop_front_photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 } // Add logo as required
  ]),
  registerVendorController
);

router.post('/register-customer-as-vendor', 
  upload.fields([
    { name: 'passport_photo', maxCount: 1 },
    { name: 'license_photo', maxCount: 1 },
    { name: 'shop_front_photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 } // Add logo as required
  ]),
  registerCustomerAsVendorController);

router.post('/check-customer-status', checkCustomerStatus);




module.exports = router;
