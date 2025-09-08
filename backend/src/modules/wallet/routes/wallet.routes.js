const express = require('express');
const { authenticate, authorizeRoles } = require('../../../middlewares/auth.middleware');
const {
  validateWalletBalance,
  validateWithdrawalAmount,
  validateBankDetails,
  validateAdminAccess,
  validateAdjustmentAmount,
  validatePagination
} = require('../middlewares/wallet.middleware');
const {
  getWalletController,
  mockTopUpController,
  payWithWalletController,
  addEarningsController,
  refundToWalletController,
  createWithdrawalRequestController,
  approveWithdrawalController,
  rejectWithdrawalController,
  getAllWithdrawalRequestsController,
  adjustBalanceController,
  getWalletTransactionsController
} = require('../controllers/wallet.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Wallet
 *     description: Wallet management endpoints
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get wallet balance and recent transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent transactions to return
 *     responses:
 *       200:
 *         description: Wallet information retrieved successfully
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
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         balance:
 *                           type: number
 *                         last_updated:
 *                           type: string
 *                           format: date-time
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                             enum: [payment, earning, refund, withdrawal, topup, adjustment]
 *                           amount:
 *                             type: number
 *                           balance_before:
 *                             type: number
 *                           balance_after:
 *                             type: number
 *                           description:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getWalletController);

/**
 * @swagger
 * /api/wallet/topup/mock:
 *   post:
 *     summary: Mock top-up for testing (without Paymob)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 100.00
 *               description:
 *                 type: string
 *                 example: "Test top-up"
 *     responses:
 *       200:
 *         description: Funds added successfully
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/topup/mock', authenticate, mockTopUpController);

/**
 * @swagger
 * /api/wallet/pay:
 *   post:
 *     summary: Pay for order using wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, amount]
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "ORD-12345"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 example: "Payment for order"
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Insufficient balance or invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/pay', authenticate, validateWalletBalance, payWithWalletController);

/**
 * @swagger
 * /api/wallet/earnings:
 *   post:
 *     summary: Add delivery man earnings
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, amount]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 25.00
 *               description:
 *                 type: string
 *                 example: "Delivery earnings"
 *               order_id:
 *                 type: string
 *                 example: "ORD-12345"
 *     responses:
 *       200:
 *         description: Earnings added successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/earnings', authenticate, addEarningsController);

/**
 * @swagger
 * /api/wallet/refund:
 *   post:
 *     summary: Refund order amount to wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, amount]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 example: "Order refund"
 *               order_id:
 *                 type: string
 *                 example: "ORD-12345"
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/refund', authenticate, refundToWalletController);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Create withdrawal request
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, bank_account, bank_name, account_holder_name]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 50
 *                 example: 100.00
 *               bank_account:
 *                 type: string
 *                 example: "1234567890"
 *               bank_name:
 *                 type: string
 *                 example: "National Bank"
 *               account_holder_name:
 *                 type: string
 *                 example: "John Doe"
 *               iban:
 *                 type: string
 *                 example: "EG12345678901234567890123456"
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *       400:
 *         description: Insufficient balance or invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw', authenticate, validateWithdrawalAmount, validateBankDetails, createWithdrawalRequestController);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions history
 *     tags: [Wallet]
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
 *           default: 20
 *         description: Number of transactions per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [payment, earning, refund, withdrawal, topup, adjustment]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/transactions', authenticate, validatePagination, getWalletTransactionsController);

module.exports = router;
