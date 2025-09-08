const { Wallet } = require('../../../app/models');

/**
 * Validate wallet balance for payment
 */
const validateWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    
    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: 'Wallet not found'
      });
    }
    
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient wallet balance'
      });
    }
    
    req.wallet = wallet;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate withdrawal amount
 */
const validateWithdrawalAmount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    // Minimum withdrawal amount
    const minWithdrawal = 50; // You can make this configurable
    if (parseFloat(amount) < minWithdrawal) {
      return res.status(400).json({
        success: false,
        error: `Minimum withdrawal amount is ${minWithdrawal}`
      });
    }
    
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    
    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: 'Wallet not found'
      });
    }
    
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient wallet balance for withdrawal'
      });
    }
    
    req.wallet = wallet;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate bank details for withdrawal
 */
const validateBankDetails = (req, res, next) => {
  const { bank_account, bank_name, account_holder_name, iban } = req.body;
  
  if (!bank_account || !bank_name || !account_holder_name) {
    return res.status(400).json({
      success: false,
      error: 'Bank account, bank name, and account holder name are required'
    });
  }
  
  // Basic validation for bank account number
  if (bank_account.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Invalid bank account number'
    });
  }
  
  // Basic validation for IBAN if provided
  if (iban && iban.length < 15) {
    return res.status(400).json({
      success: false,
      error: 'Invalid IBAN format'
    });
  }
  
  next();
};

/**
 * Validate admin access for wallet operations
 */
const validateAdminAccess = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

/**
 * Validate amount for adjustments
 */
const validateAdjustmentAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required'
    });
  }
  
  // Maximum adjustment amount (you can make this configurable)
  const maxAdjustment = 10000;
  if (Math.abs(parseFloat(amount)) > maxAdjustment) {
    return res.status(400).json({
      success: false,
      error: `Adjustment amount cannot exceed ${maxAdjustment}`
    });
  }
  
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page number must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateWalletBalance,
  validateWithdrawalAmount,
  validateBankDetails,
  validateAdminAccess,
  validateAdjustmentAmount,
  validatePagination
};
