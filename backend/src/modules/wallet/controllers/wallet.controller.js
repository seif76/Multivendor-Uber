const {
  getWalletInfo,
  addFunds,
  deductFunds,
  addEarnings,
  refundToWallet,
  createWithdrawalRequest,
  approveWithdrawal,
  rejectWithdrawal,
  adjustBalance,
  getAllWithdrawalRequests,
  getWalletTransactions
} = require('../services/wallet.service');

/**
 * Get wallet balance and recent transactions
 */
const getWalletController = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const walletInfo = await getWalletInfo(userId, limit);
    
    res.status(200).json({
      success: true,
      data: walletInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Mock top-up for testing (without Paymob)
 */
const mockTopUpController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    const result = await addFunds(
      userId, 
      amount, 
      description || 'Mock top-up for testing'
    );
    
    res.status(200).json({
      success: true,
      message: 'Funds added successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Pay for order using wallet
 */
const payWithWalletController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, amount, description } = req.body;
    
    if (!order_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and valid amount are required'
      });
    }
    
    const result = await deductFunds(
      userId,
      amount,
      description || `Payment for order #${order_id}`,
      order_id,
      'order'
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Add delivery man earnings
 */
const addEarningsController = async (req, res) => {
  try {
    const { user_id, amount, description, order_id } = req.body;
    
    if (!user_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID and valid amount are required'
      });
    }
    
    const result = await addEarnings(
      user_id,
      amount,
      description || 'Delivery earnings',
      order_id
    );
    
    res.status(200).json({
      success: true,
      message: 'Earnings added successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Refund to wallet
 */
const refundToWalletController = async (req, res) => {
  try {
    const { user_id, amount, description, order_id } = req.body;
    
    if (!user_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID and valid amount are required'
      });
    }
    
    const result = await refundToWallet(
      user_id,
      amount,
      description || 'Order refund',
      order_id
    );
    
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create withdrawal request
 */
const createWithdrawalRequestController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bank_account, bank_name, account_holder_name, iban } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    if (!bank_account || !bank_name || !account_holder_name) {
      return res.status(400).json({
        success: false,
        error: 'Bank account details are required'
      });
    }
    
    const bankDetails = {
      bank_account,
      bank_name,
      account_holder_name,
      iban
    };
    
    const withdrawalRequest = await createWithdrawalRequest(userId, amount, bankDetails);
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawalRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Approve withdrawal request (Admin only)
 */
const approveWithdrawalController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const result = await approveWithdrawal(parseInt(id), adminId);
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reject withdrawal request (Admin only)
 */
const rejectWithdrawalController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const adminId = req.user.id;
    
    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    const result = await rejectWithdrawal(parseInt(id), adminId, rejection_reason);
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all withdrawal requests (Admin only)
 */
const getAllWithdrawalRequestsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    const result = await getAllWithdrawalRequests(page, limit, status);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manual balance adjustment (Admin only)
 */
const adjustBalanceController = async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;
    const adminId = req.user.id;
    
    if (!user_id || !amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'User ID, amount, and description are required'
      });
    }
    
    const result = await adjustBalance(user_id, amount, description, adminId);
    
    res.status(200).json({
      success: true,
      message: 'Balance adjusted successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get wallet transactions history
 */
const getWalletTransactionsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    
    const result = await getWalletTransactions(userId, page, limit, type);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
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
};
