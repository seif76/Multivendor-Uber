const express = require('express');
const {
  registerVendorController,
  editVendorController,
  deleteVendorController,
  getVendorByPhoneController,
  getPendingVendorsController,
  getActiveVendorsController,
  getDeactivatedVendorsController,
  setVendorStatusController,
  getAllVendorsController,
  getAllVendorStatusCountsController,
  getVendorProfileController,
  getVendorWithProductsByPhoneController,
  updateVendorProfileController,
} = require('../controllers/vendor.controller');
const { dashboardSummaryController } = require('../controllers/dashboard.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const  upload  = require('../../../middlewares/uploadLocal');


const router = express.Router();

const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);


const productRoutes = require('./product.routes');
router.use('/products', productRoutes);

const categoryRoutes = require('./category.routes');
router.use('/categories', categoryRoutes);

const orderRoutes = require('./order.routes');
router.use('/orders', orderRoutes);

const workingHourRoutes = require('./workingHour.routes');
router.use('/vendor-working-hours', workingHourRoutes);

/**
 * @swagger
 * tags:
 *   - name: Vendors
 *     description: Vendor management endpoints
 */
/**
 * @swagger
 * /api/vendor/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, info]
 *             properties:
 *               user:
 *                 type: object
 *                 required: [name, email, phone_number, password, vendor_status]
 *                 properties:
 *                   name: 
 *                     type: string
 *                     example: "Ahmed Vendor"
 *                   email: 
 *                     type: string
 *                     example: "vendor@example.com"
 *                   phone_number: 
 *                     type: string
 *                     example: "01112345678"
 *                   password: 
 *                     type: string
 *                     example: "securepassword"
 *                   vendor_status: 
 *                     type: string
 *                     enum: [pending, Active, Deactivated]
 *                     example: "pending"
 *               info:
 *                 type: object
 *                 required: [shop_name, shop_location, owner_name, phone_number, passport_photo, shop_front_photo]
 *                 properties:
 *                   shop_name: 
 *                     type: string
 *                     example: "Tech Shop"
 *                   shop_location: 
 *                     type: string
 *                     example: "Cairo, Egypt"
 *                   owner_name: 
 *                     type: string
 *                     example: "Ahmed Mohamed"
 *                   phone_number: 
 *                     type: string
 *                     example: "01112345678"
 *                   passport_photo: 
 *                     type: string
 *                     example: "passport.jpg"
 *                   license_photo: 
 *                     type: string
 *                     example: "license.jpg"
 *                   shop_front_photo: 
 *                     type: string
 *                     example: "storefront.jpg"
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Internal server error
 */

router.post('/register', registerVendorController);

/**
 * @swagger
 * /api/vendor/edit:
 *   put:
 *     summary: Edit vendor information
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, user, info]
 *             properties:
 *               phone_number:
 *                 type: string
 *               user:
 *                 type: object
 *               info:
 *                 type: object
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.put('/edit', editVendorController);

/**
 * @swagger
 * /api/vendor/update-profile:
 *   put:
 *     summary: Update vendor profile information
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [shop_name, shop_location, owner_name, phone_number]
 *             properties:
 *               shop_name:
 *                 type: string
 *                 example: "My Shop"
 *               shop_location:
 *                 type: string
 *                 example: "Cairo, Egypt"
 *               owner_name:
 *                 type: string
 *                 example: "Ahmed Mohamed"
 *               phone_number:
 *                 type: string
 *                 example: "01112345678"
 *               shop_front_photo:
 *                 type: string
 *                 format: binary
 *                 description: Shop front photo (optional)
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update-profile', authenticate, upload.fields([
  { name: 'shop_front_photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), updateVendorProfileController);

/**
 * @swagger
 * /api/vendor/delete:
 *   delete:
 *     summary: Delete vendor by phone number
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Phone number of the vendor to delete
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.delete('/delete', deleteVendorController);

/**
 * @swagger
 * /api/vendor/get-by-phone:
 *   get:
 *     summary: Get vendor by phone number
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Phone number of the vendor
 *     responses:
 *       200:
 *         description: Vendor found
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get('/get-by-phone', authenticate, getVendorByPhoneController);

/**
 * @swagger
 * /api/vendor/pending:
 *   get:
 *     summary: Get all pending vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of pending vendors
 *       500:
 *         description: Server error
 */
router.get('/pending', getPendingVendorsController);

/**
 * @swagger
 * /api/vendor/active:
 *   get:
 *     summary: Get all active vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of active vendors
 *       500:
 *         description: Server error
 */
router.get('/active', getActiveVendorsController);

/**
 * @swagger
 * /api/vendor/deactivated:
 *   get:
 *     summary: Get all deactivated vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of deactivated vendors
 *       500:
 *         description: Server error
 */
router.get('/deactivated', getDeactivatedVendorsController);

/**
 * @swagger
 * /api/vendor/status:
 *   put:
 *     summary: Update vendor status (approve or reject)
 *     tags: [Vendors]
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
 *                 example: "01112345678"
 *               status:
 *                 type: string
 *                 enum: [pending, Active, Deactivated]
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/status', setVendorStatusController);

/**
 * @swagger
 * /api/vendor/all:
 *   get:
 *     summary: Get all vendors with optional status filtering
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (default 10)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, Active, Deactivated]
 *         description: Filter by vendor status
 *     responses:
 *       200:
 *         description: List of vendors with pagination
 *       500:
 *         description: Server error
 */
router.get('/all', getAllVendorsController);

/**
 * @swagger
 * /api/vendor/get-all-status-counts:
 *   get:
 *     summary: Get counts of vendors by status
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: Status counts returned
 *       500:
 *         description: Server error
 */
router.get('/get-all-status-counts', getAllVendorStatusCountsController);

/**
 * @swagger
 * /api/vendor/profile:
 *   get:
 *     summary: Get vendor profile by token (auth not required here for now)
 *     tags: [Vendors]
 *     description: In future this route will require authentication
 *     responses:
 *       200:
 *         description: Vendor profile
 *       500:
 *         description: Server error
 */
router.get('/profile',authenticate , getVendorProfileController);

/**
 * @swagger
 * /api/vendor/profile-with-products/{phone_number}:
 *   get:
 *     summary: Get vendor profile and products by phone number
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor's phone number
 *     responses:
 *       200:
 *         description: Vendor profile and products returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendorInfo:
 *                   type: object
 *                   properties:
 *                     shop_name:
 *                       type: string
 *                     shop_location:
 *                       type: string
 *                     owner_name:
 *                       type: string
 *                     shop_front_photo:
 *                       type: string
 *                     vendor_id:
 *                       type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       stock:
 *                         type: integer
 *                       image:
 *                         type: string
 *                       category:
 *                         type: string
 *                       status:
 *                         type: string
 *       404:
 *         description: Vendor or user not found
 *       500:
 *         description: Server error
 */
router.get('/profile-with-products/:phone_number', getVendorWithProductsByPhoneController);
router.get('/dashboard/summary', authenticate, dashboardSummaryController);

module.exports = router;
