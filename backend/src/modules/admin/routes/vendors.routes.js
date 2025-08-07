const express = require('express');
const {
  getAllVendorsController,
  getVendorStatsController,
  updateVendorStatusController,
  deleteVendorController,
  getVendorByIdController,
  getPendingVendorsController,
  updateVendorDetailsController
} = require('../controllers/vendors.controller');

const router = express.Router();

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors with pagination and filtering
 *     tags: [Admin Vendors]
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
 *         description: Number of vendors per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, pending, Deactivated]
 *         description: Filter by vendor status
 *     responses:
 *       200:
 *         description: List of vendors
 *       500:
 *         description: Server error
 */
router.get('/', getAllVendorsController);

/**
 * @swagger
 * /api/admin/vendors/stats:
 *   get:
 *     summary: Get vendor statistics
 *     tags: [Admin Vendors]
 *     responses:
 *       200:
 *         description: Vendor statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', getVendorStatsController);

/**
 * @swagger
 * /api/admin/vendors/status:
 *   put:
 *     summary: Update vendor status
 *     tags: [Admin Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, vendor_status]
 *             properties:
 *               phone_number:
 *                 type: string
 *               vendor_status:
 *                 type: string
 *                 enum: [Active, pending, Deactivated]
 *     responses:
 *       200:
 *         description: Vendor status updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/status', updateVendorStatusController);

/**
 * @swagger
 * /api/admin/vendors/update:
 *   put:
 *     summary: Update vendor details
 *     tags: [Admin Vendors]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               vendor_status:
 *                 type: string
 *                 enum: [Active, pending, Deactivated]
 *               shop_name:
 *                 type: string
 *               shop_location:
 *                 type: string
 *               owner_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor details updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/update', updateVendorDetailsController);

/**
 * @swagger
 * /api/admin/vendors/delete:
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Admin Vendors]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor phone number
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.delete('/delete', deleteVendorController);

/**
 * @swagger
 * /api/admin/vendors/details:
 *   get:
 *     summary: Get vendor details by phone number
 *     tags: [Admin Vendors]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor phone number
 *     responses:
 *       200:
 *         description: Vendor details
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get('/details', getVendorByIdController);

/**
 * @swagger
 * /api/admin/vendors/pending:
 *   get:
 *     summary: Get pending vendors
 *     tags: [Admin Vendors]
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
 *         description: Number of vendors per page
 *     responses:
 *       200:
 *         description: List of pending vendors
 *       500:
 *         description: Server error
 */
router.get('/pending', getPendingVendorsController);

module.exports = router; 