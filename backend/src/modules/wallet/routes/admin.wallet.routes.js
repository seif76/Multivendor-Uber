const express = require('express');
const { authenticate, authorizeRoles } = require('../../../middlewares/auth.middleware');
const {
  validateAdminAccess,
  validateAdjustmentAmount,
  validatePagination
} = require('../middlewares/wallet.middleware');
const {
  approveWithdrawalController,
  rejectWithdrawalController,
  getAllWithdrawalRequestsController,
  adjustBalanceController
} = require('../controllers/wallet.controller');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Admin Wallet
 *     description: Admin wallet management endpoints
 */

/**
 * @swagger
 * /api/admin/wallet/withdrawals:
 *   get:
 *     summary: Get all withdrawal requests
 *     tags: [Admin Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of requests per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, processing, completed]
 *         description: Filter by withdrawal status
 *     responses:
 *       200:
 *         description: Withdrawal requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawalRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           amount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           bank_account:
 *                             type: string
 *                           bank_name:
 *                             type: string
 *                           account_holder_name:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           wallet:
 *                             type: object
 *                             properties:
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   phone_number:
 *                                     type: string
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalRequests:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/withdrawals', validatePagination, getAllWithdrawalRequestsController);

/**
 * @swagger
 * /api/admin/wallet/withdraw/{id}/approve:
 *   post:
 *     summary: Approve a withdrawal request
 *     tags: [Admin Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Withdrawal request ID
 *     responses:
 *       200:
 *         description: Withdrawal approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawalRequest:
 *                       type: object
 *                     transaction:
 *                       type: object
 *       400:
 *         description: Withdrawal request not found or not pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw/:id/approve', approveWithdrawalController);

/**
 * @swagger
 * /api/admin/wallet/withdraw/{id}/reject:
 *   post:
 *     summary: Reject a withdrawal request
 *     tags: [Admin Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Withdrawal request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejection_reason]
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 example: "Insufficient documentation"
 *     responses:
 *       200:
 *         description: Withdrawal rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Withdrawal request not found or not pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw/:id/reject', rejectWithdrawalController);

/**
 * @swagger
 * /api/admin/wallet/adjust:
 *   post:
 *     summary: Manually adjust user wallet balance
 *     tags: [Admin Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, amount, description]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 123
 *               amount:
 *                 type: number
 *                 example: 50.00
 *                 description: "Positive for credit, negative for debit"
 *               description:
 *                 type: string
 *                 example: "Manual balance adjustment"
 *     responses:
 *       200:
 *         description: Balance adjusted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                     transaction:
 *                       type: object
 *       400:
 *         description: Invalid data or user not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/adjust', validateAdjustmentAmount, adjustBalanceController);

module.exports = router;
