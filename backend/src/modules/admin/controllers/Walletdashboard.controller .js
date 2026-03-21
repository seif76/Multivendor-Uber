const {
  getAdminWalletBalance,
  getAllWalletTransactions,
  getAllCodDebts,
  getDeliverymanDebtDetails,
  getAllDeliverymenDebtSummary,
} = require('../services/Walletdashboard.service');

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

module.exports = {
  getAdminWalletBalanceController,
  getAllWalletTransactionsController,
  getAllCodDebtsController,
  getDeliverymanDebtDetailsController,
  getAllDeliverymenDebtSummaryController,
};