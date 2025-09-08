const express = require('express');
const {
  registerDeliverymanController,
  registerCustomerAsDeliverymanController,
  getDeliverymanProfileController,
  updateDeliverymanProfileController,
  updateVehicleInfoController,
  getDeliverymenByStatusController,
  setDeliverymanStatusController,
  getDeliverymanStatusCountsController,
  deleteDeliverymanController,
  acceptDeliveryOrderController,
} = require('../controllers/deliveryman.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const upload = require('../../../middlewares/uploadLocal');

const router = express.Router();

// Import auth routes
const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

/**
 * @swagger
 * tags:
 *   - name: Deliverymen
 *     description: Deliveryman management endpoints
 */

/**
 * @swagger
 * /api/deliveryman/register:
 *   post:
 *     summary: Register a new deliveryman
 *     tags: [Deliverymen]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone_number, vehicleData]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmed Deliveryman"
 *               email:
 *                 type: string
 *                 example: "ahmed@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *               phone_number:
 *                 type: string
 *                 example: "01112345678"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               vehicleData:
 *                 type: object
 *                 required: [make, model, year, license_plate, vehicle_type, color]
 *                 properties:
 *                   make:
 *                     type: string
 *                     example: "Toyota"
 *                   model:
 *                     type: string
 *                     example: "Corolla"
 *                   year:
 *                     type: integer
 *                     example: 2020
 *                   license_plate:
 *                     type: string
 *                     example: "ABC-123"
 *                   vehicle_type:
 *                     type: string
 *                     enum: [car, motorcycle, bicycle]
 *                     example: "car"
 *                   color:
 *                     type: string
 *                     example: "White"
 *     responses:
 *       201:
 *         description: Deliveryman registered successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/register', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'driver_license_photo', maxCount: 1 },
  { name: 'national_id_photo', maxCount: 1 }
]), registerDeliverymanController);

/**
 * @swagger
 * /api/deliveryman/register-customer:
 *   post:
 *     summary: Register existing customer as deliveryman
 *     tags: [Deliverymen]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [customer_id, vehicleData]
 *             properties:
 *               customer_id:
 *                 type: integer
 *                 example: 1
 *               vehicleData:
 *                 type: object
 *                 required: [make, model, year, license_plate, vehicle_type, color]
 *                 properties:
 *                   make:
 *                     type: string
 *                     example: "Honda"
 *                   model:
 *                     type: string
 *                     example: "Civic"
 *                   year:
 *                     type: integer
 *                     example: 2019
 *                   license_plate:
 *                     type: string
 *                     example: "XYZ-789"
 *                   vehicle_type:
 *                     type: string
 *                     enum: [car, motorcycle, bicycle]
 *                     example: "car"
 *                   color:
 *                     type: string
 *                     example: "Black"
 *     responses:
 *       201:
 *         description: Customer registered as deliveryman successfully
 *       400:
 *         description: Customer ID and vehicle data are required
 *       500:
 *         description: Internal server error
 */
router.post('/register-customer', upload.fields([
  { name: 'driver_license_photo', maxCount: 1 },
  { name: 'national_id_photo', maxCount: 1 }
]), registerCustomerAsDeliverymanController);

/**
 * @swagger
 * /api/deliveryman/profile:
 *   get:
 *     summary: Get deliveryman profile
 *     tags: [Deliverymen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deliveryman profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 deliveryman_status:
 *                   type: string
 *                 profile_photo:
 *                   type: string
 *                 delivery_vehicle:
 *                   type: object
 *                   properties:
 *                     make:
 *                       type: string
 *                     model:
 *                       type: string
 *                     year:
 *                       type: integer
 *                     license_plate:
 *                       type: string
 *                     vehicle_type:
 *                       type: string
 *                     color:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deliveryman not found
 */
router.get('/profile', authenticate, getDeliverymanProfileController);

/**
 * @swagger
 * /api/deliveryman/update-profile:
 *   put:
 *     summary: Update deliveryman profile
 *     tags: [Deliverymen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmed Updated"
 *               email:
 *                 type: string
 *                 example: "ahmed.updated@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "01112345678"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Missing required fields or upload error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deliveryman not found
 */
router.put('/update-profile', authenticate, upload.fields([
  { name: 'profile_photo', maxCount: 1 }
]), updateDeliverymanProfileController);

/**
 * @swagger
 * /api/deliveryman/update-vehicle:
 *   put:
 *     summary: Update vehicle information
 *     tags: [Deliverymen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *                 example: "Toyota"
 *               model:
 *                 type: string
 *                 example: "Camry"
 *               year:
 *                 type: integer
 *                 example: 2021
 *               license_plate:
 *                 type: string
 *                 example: "DEF-456"
 *               vehicle_type:
 *                 type: string
 *                 enum: [car, motorcycle, bicycle]
 *                 example: "car"
 *               color:
 *                 type: string
 *                 example: "Blue"
 *               driver_license_photo:
 *                 type: string
 *                 format: binary
 *                 description: Driver license photo (optional)
 *               national_id_photo:
 *                 type: string
 *                 format: binary
 *                 description: National ID photo (optional)
 *     responses:
 *       200:
 *         description: Vehicle information updated successfully
 *       400:
 *         description: Missing required fields or upload error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vehicle not found
 */
router.put('/update-vehicle', authenticate, upload.fields([
  { name: 'driver_license_photo', maxCount: 1 },
  { name: 'national_id_photo', maxCount: 1 }
]), updateVehicleInfoController);

/**
 * @swagger
 * /api/deliveryman/status/{status}:
 *   get:
 *     summary: Get deliverymen by status (Admin function)
 *     tags: [Deliverymen]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, active, inactive]
 *         description: Deliveryman status
 *     responses:
 *       200:
 *         description: List of deliverymen with specified status
 *       500:
 *         description: Internal server error
 */
router.get('/status/:status', getDeliverymenByStatusController);

/**
 * @swagger
 * /api/deliveryman/set-status:
 *   put:
 *     summary: Set deliveryman status (Admin function)
 *     tags: [Deliverymen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryman_id, status]
 *             properties:
 *               deliveryman_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [pending, active, inactive]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Deliveryman status updated successfully
 *       400:
 *         description: Deliveryman ID and status are required
 *       500:
 *         description: Internal server error
 */
router.put('/set-status', setDeliverymanStatusController);

/**
 * @swagger
 * /api/deliveryman/status-counts:
 *   get:
 *     summary: Get deliveryman status counts (Admin function)
 *     tags: [Deliverymen]
 *     responses:
 *       200:
 *         description: Status counts returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   deliveryman_status:
 *                     type: string
 *                   count:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/status-counts', getDeliverymanStatusCountsController);

/**
 * @swagger
 * /api/deliveryman/delete/{deliveryman_id}:
 *   delete:
 *     summary: Delete deliveryman (Admin function)
 *     tags: [Deliverymen]
 *     parameters:
 *       - in: path
 *         name: deliveryman_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Deliveryman ID to delete
 *     responses:
 *       200:
 *         description: Deliveryman deleted successfully
 *       400:
 *         description: Invalid deliveryman ID
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:deliveryman_id', deleteDeliverymanController);

/**
 * @swagger
 * /api/deliveryman/orders/{orderId}/accept:
 *   put:
 *     summary: Accept a delivery order
 *     tags: [Deliverymen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID to accept
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliverymanId]
 *             properties:
 *               deliverymanId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the deliveryman accepting the order
 *     responses:
 *       200:
 *         description: Order accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Delivery order accepted successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "shipped"
 *                     deliveryman_id:
 *                       type: integer
 *       400:
 *         description: Deliveryman ID mismatch or order not ready
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/orders/:orderId/accept', authenticate, acceptDeliveryOrderController);

module.exports = router;
