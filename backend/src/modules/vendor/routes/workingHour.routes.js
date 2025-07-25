const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const {
  getVendorWorkingHoursController,
  addVendorWorkingHourController,
  updateVendorWorkingHourController,
  deleteVendorWorkingHourController,
  getPublicWorkingHoursController,
  isVendorOpenNowController,
} = require('../controllers/workingHour.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: VendorWorkingHours
 *     description: Vendor working hours management
 */

/**
 * @swagger
 * /api/vendor/working-hours:
 *   get:
 *     summary: Get all working hours for the logged-in vendor
 *     tags: [VendorWorkingHours]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of working hours
 */
router.get('/working-hours', authenticate, getVendorWorkingHoursController);

/**
 * @swagger
 * /api/vendor/working-hours:
 *   post:
 *     summary: Add a new working hour interval
 *     tags: [VendorWorkingHours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [day_of_week, open_time, close_time]
 *             properties:
 *               day_of_week:
 *                 type: integer
 *                 example: 1
 *               open_time:
 *                 type: string
 *                 example: '08:00'
 *               close_time:
 *                 type: string
 *                 example: '17:00'
 *     responses:
 *       200:
 *         description: Working hour added
 */
router.post('/working-hours', authenticate, addVendorWorkingHourController);

/**
 * @swagger
 * /api/vendor/working-hours/{id}:
 *   put:
 *     summary: Update a working hour interval
 *     tags: [VendorWorkingHours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Working hour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [day_of_week, open_time, close_time]
 *             properties:
 *               day_of_week:
 *                 type: integer
 *                 example: 1
 *               open_time:
 *                 type: string
 *                 example: '08:00'
 *               close_time:
 *                 type: string
 *                 example: '17:00'
 *     responses:
 *       200:
 *         description: Working hour updated
 */
router.put('/working-hours/:id', authenticate, updateVendorWorkingHourController);

/**
 * @swagger
 * /api/vendor/working-hours/{id}:
 *   delete:
 *     summary: Delete a working hour interval
 *     tags: [VendorWorkingHours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Working hour ID
 *     responses:
 *       200:
 *         description: Working hour deleted
 */
router.delete('/working-hours/:id', authenticate, deleteVendorWorkingHourController);

/**
 * @swagger
 * /api/vendor/{vendorId}/working-hours:
 *   get:
 *     summary: Get public working hours for a vendor
 *     tags: [VendorWorkingHours]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: List of working hours
 */
router.get('/:vendorId/working-hours', getPublicWorkingHoursController);

/**
 * @swagger
 * /api/vendor/{vendorId}/is-open:
 *   get:
 *     summary: Check if vendor is open now
 *     tags: [VendorWorkingHours]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Open status
 */
router.get('/:vendorId/is-open', isVendorOpenNowController);

module.exports = router; 