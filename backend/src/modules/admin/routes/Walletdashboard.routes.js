const express = require('express');
const router = express.Router();
const {
  getAdminWalletBalanceController,
  getAllWalletTransactionsController,
  getAllCodDebtsController,
  getDeliverymanDebtDetailsController,
  getAllDeliverymenDebtSummaryController,
} = require('../controllers/Walletdashboard.controller ');

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

module.exports = router;