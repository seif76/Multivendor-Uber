const {
  getAdminWalletBalance,
  getAllWalletTransactions,
  getAllCodDebts,
  getDeliverymanDebtDetails,
  getAllDeliverymenDebtSummary,
} = require('../services/Walletdashboard.service');

const {
  settleDebtByAmount,
  settleAllDebt,
} = require('../../deliveryman/services/codDebt.service');

/**
 * Get admin wallet balance (service fees collected)
 */
const getAdminWalletBalanceController = async (req, res) => {
  try {
    const result = await getAdminWalletBalance();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all wallet transactions (paginated)
 */
const getAllWalletTransactionsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || null;

    const result = await getAllWalletTransactions(page, limit, category);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all COD debts (paginated, filterable by status)
 */
const getAllCodDebtsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;

    const result = await getAllCodDebts(page, limit, status);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get COD debt details for a specific deliveryman
 */
const getDeliverymanDebtDetailsController = async (req, res) => {
  try {
    const { deliverymanId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getDeliverymanDebtDetails(parseInt(deliverymanId), page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all deliverymen with their debt summary
 */
const getAllDeliverymenDebtSummaryController = async (req, res) => {
  try {
    const result = await getAllDeliverymenDebtSummary();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Settle debt by amount for a specific deliveryman
 */
const settleDebtByAmountController = async (req, res) => {
  try {
    const { deliverymanId } = req.params;
    const { amount } = req.body;
    const adminId = req.user?.id;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const result = await settleDebtByAmount(parseInt(deliverymanId), parseFloat(amount), adminId);
    res.status(200).json({ success: true, message: 'Debt settled successfully', data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Settle all debt for a specific deliveryman
 */
const settleAllDebtController = async (req, res) => {
  try {
    const { deliverymanId } = req.params;
    const adminId = req.user?.id;

    const result = await settleAllDebt(parseInt(deliverymanId), adminId);
    res.status(200).json({ success: true, message: 'All debt settled successfully', data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAdminWalletBalanceController,
  getAllWalletTransactionsController,
  getAllCodDebtsController,
  getDeliverymanDebtDetailsController,
  getAllDeliverymenDebtSummaryController,
  settleDebtByAmountController,
  settleAllDebtController,
};