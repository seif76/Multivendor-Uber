const express = require('express');
const router = express.Router();
const {
  getAdminWalletBalanceController,
  getAllWalletTransactionsController,
  getAllCodDebtsController,
  getDeliverymanDebtDetailsController,
  getAllDeliverymenDebtSummaryController,
  settleDebtByAmountController,
  settleAllDebtController,
  
  
} = require('../controllers/Walletdashboard.controller ');

const{
    getAllWalletsController,
    freezeWalletController,
    unfreezeWalletController,
}= require('../controllers/Freezewallet.controller');

const{
    getAllWithdrawalRequestsController,
    approveWithdrawalController,
    rejectWithdrawalController,
}= require('../../wallet/controllers/wallet.controller');

// Admin wallet balance
router.get('/balance', getAdminWalletBalanceController);

// All wallet transactions
router.get('/transactions', getAllWalletTransactionsController);

// All COD debts
router.get('/cod-debts', getAllCodDebtsController);

// All deliverymen debt summary
router.get('/cod-debts/summary', getAllDeliverymenDebtSummaryController);

// Specific deliveryman debt details
router.get('/cod-debts/:deliverymanId', getDeliverymanDebtDetailsController);

// Settle debt by amount for a specific deliveryman (Admin only)
router.post('/cod-debts/:deliverymanId/settle-amount', settleDebtByAmountController);

// Settle all debt for a specific deliveryman (Admin only)
router.post('/cod-debts/:deliverymanId/settle-all', settleAllDebtController);

// All wallets list with freeze status
router.get('/wallets', getAllWalletsController);
 
// Freeze / unfreeze a wallet (Admin only)
router.post('/wallets/:userId/freeze', freezeWalletController);
router.post('/wallets/:userId/unfreeze', unfreezeWalletController);

router.get('/withdrawals', getAllWithdrawalRequestsController);
router.post('/withdrawals/:id/approve', approveWithdrawalController);
router.post('/withdrawals/:id/reject', rejectWithdrawalController);

module.exports = router;