const express = require('express');
const { loginCaptainController,registerCaptainController } = require('../controllers/auth.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Captain Auth
 *   description: Authentication endpoints for captains
 */

/**
 * @swagger
 * /api/captain/auth/register:
 *   post:
 *     summary: Register a new captain with vehicle
 *     tags: [Captain Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, vehicle]
 *             properties:
 *               user:
 *                 type: object
 *                 required: [name, email, password, phone_number]
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Ahmed Khaled
 *                   email:
 *                     type: string
 *                     example: ahmed@example.com
 *                   password:
 *                     type: string
 *                     example: 123456
 *                   phone_number:
 *                     type: string
 *                     example: "0100000000"
 *                   gender:
 *                     type: string
 *                     enum: [male, female]
 *                     example: male
 *                   profile_photo:
 *                     type: string
 *                     example: https://example.com/photo.jpg
 *               vehicle:
 *                 type: object
 *                 required: [make, model, year, license_plate, vehicle_type, driver_license_photo, national_id_photo]
 *                 properties:
 *                   make:
 *                     type: string
 *                     example: Toyota
 *                   model:
 *                     type: string
 *                     example: Corolla
 *                   year:
 *                     type: string
 *                     example: "2020"
 *                   license_plate:
 *                     type: string
 *                     example: ABC123
 *                   vehicle_type:
 *                     type: string
 *                     enum: [sedan, suv, truck]
 *                     example: sedan
 *                   color:
 *                     type: string
 *                     example: white
 *                   driver_license_photo:
 *                     type: string
 *                     example: https://example.com/license.jpg
 *                   national_id_photo:
 *                     type: string
 *                     example: https://example.com/id.jpg
 *     responses:
 *       201:
 *         description: Captain registered successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/captain/auth/login:
 *   post:
 *     summary: Captain login
 *     tags: [Captain Auth]
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
 *         description: Captain not found
 *       500:
 *         description: Internal server error
 */



router.post('/login', loginCaptainController);
router.post('/register', registerCaptainController);

module.exports = router;
