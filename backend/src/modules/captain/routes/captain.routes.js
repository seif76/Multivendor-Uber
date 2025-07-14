// const express = require('express');
// const { deleteCaptainController, editCaptainController,
//         getCaptainByPhoneController,setCaptainStatusController,getActiveCaptainsController,
//         getPendingCaptainsController,getDeactivatedCaptainsController,getCaptainProfileController,
//         getAllCaptainsController,
//         getAllCaptainStatusCountsController,
//       } = require('../controllers/captain.controller');
// const { authenticate } = require('../../../middlewares/auth.middleware')
// const router = express.Router();
// const authRoutes = require('../routes/auth.routes')
// router.use('/auth', authRoutes);

// //router.post('/register', registerCaptainController);
// router.put('/edit',authenticate, editCaptainController);


// router.get('/active',authenticate, getActiveCaptainsController);

// router.get('/deactivated',authenticate, getDeactivatedCaptainsController);
// router.get('/profile',authenticate,getCaptainProfileController)




// // for Admin Dashboard

// router.get('/all', getAllCaptainsController);
// router.get('/get-all-captains-status', getAllCaptainStatusCountsController);
// router.delete('/delete', deleteCaptainController);
// router.get('/pending', getPendingCaptainsController);
// router.put('/status', setCaptainStatusController);

// router.get('/get-by-phone', getCaptainByPhoneController);






// module.exports = router;




const express = require('express');
const {
  deleteCaptainController,
  editCaptainController,
  getCaptainByPhoneController,
  setCaptainStatusController,
  getActiveCaptainsController,
  getPendingCaptainsController,
  getDeactivatedCaptainsController,
  getCaptainProfileController,
  getAllCaptainsController,
  getAllCaptainStatusCountsController,
} = require('../controllers/captain.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const router = express.Router();

const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

/**
 * @swagger
 * tags:
 *   - name: Captains
 *     description: Captain management endpoints
 */

/**
 * @swagger
 * /api/captain/edit:
 *   put:
 *     summary: Edit captain information (authenticated)
 *     tags: [Captains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [updates]
 *             properties:
 *               updates:
 *                 type: object
 *                 example:
 *                   name: Ahmed Updated
 *                   gender: male
 *     responses:
 *       200:
 *         description: Captain updated successfully
 */
router.put('/edit', authenticate, editCaptainController);

/**
 * @swagger
 * /api/captain/active:
 *   get:
 *     summary: Get all active captains
 *     tags: [Captains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active captains
 */
router.get('/active', authenticate, getActiveCaptainsController);

/**
 * @swagger
 * /api/captain/deactivated:
 *   get:
 *     summary: Get all deactivated captains
 *     tags: [Captains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deactivated captains
 */
router.get('/deactivated', authenticate, getDeactivatedCaptainsController);

/**
 * @swagger
 * /api/captain/profile:
 *   get:
 *     summary: Get authenticated captain's profile
 *     tags: [Captains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Captain profile retrieved
 */
router.get('/profile', authenticate, getCaptainProfileController); // used in the context frontend

// ---------- Admin Routes ----------

/**
 * @swagger
 * /api/captain/all:
 *   get:
 *     summary: Get all captains (admin)
 *     tags: [Captains]
 *     responses:
 *       200:
 *         description: List of all captains
 */
router.get('/all', getAllCaptainsController);

/**
 * @swagger
 * /api/captain/get-all-captains-status:
 *   get:
 *     summary: Get counts of active, pending, and deactivated captains
 *     tags: [Captains]
 *     responses:
 *       200:
 *         description: Status counts returned
 */
router.get('/get-all-captains-status', getAllCaptainStatusCountsController);

/**
 * @swagger
 * /api/captain/delete:
 *   delete:
 *     summary: Delete captain by phone number (admin)
 *     tags: [Captains]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Captain's phone number
 *     responses:
 *       200:
 *         description: Captain deleted successfully
 *       400:
 *         description: Missing phone number
 *       404:
 *         description: Captain not found
 */

router.delete('/delete', deleteCaptainController);

/**
 * @swagger
 * /api/captain/pending:
 *   get:
 *     summary: Get all pending captain registrations (admin)
 *     tags: [Captains]
 *     responses:
 *       200:
 *         description: List of pending captains
 */
router.get('/pending', getPendingCaptainsController);

/**
 * @swagger
 * /api/captain/status:
 *   put:
 *     summary: Approve or reject captain registration (admin)
 *     tags: [Captains]
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
 *                 example: "01000000000"
 *               status:
 *                 type: string
 *                 enum: [Active, Deactivated]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/status', setCaptainStatusController);

/**
 * @swagger
 * /api/captain/get-by-phone:
 *   get:
 *     summary: Get full captain and vehicle details by phone (admin)
 *     tags: [Captains]
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Captain and vehicle data retrieved
 */
router.get('/get-by-phone', getCaptainByPhoneController);

module.exports = router;
