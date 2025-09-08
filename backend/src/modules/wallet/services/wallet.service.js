const { Wallet, WalletTransaction, WithdrawalRequest, User, Order } = require('../../../app/models');
const { Op } = require('sequelize');

/**
 * Get or create wallet for user
 */
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ where: { user_id: userId } });
  
  if (!wallet) {
    wallet = await Wallet.create({
      user_id: userId,
      balance: 0,
      last_updated: new Date()
    });
  }
  
  return wallet;
};

/**
 * Get wallet balance and recent transactions
 */
const getWalletInfo = async (userId, limit = 10) => {
  const wallet = await getOrCreateWallet(userId);
  
  const transactions = await WalletTransaction.findAll({
    where: { wallet_id: wallet.id },
    order: [['createdAt', 'DESC']],
    limit,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }
    ]
  });

  return {
    wallet,
    transactions
  };
};

/**
 * Add funds to wallet (topup)
 */
const addFunds = async (userId, amount, description = 'Wallet top-up', referenceId = null, referenceType = 'topup') => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const balanceAfter = balanceBefore + parseFloat(amount);
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'topup',
    amount: parseFloat(amount),
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
    reference_id: referenceId,
    reference_type: referenceType,
    status: 'completed'
  });
  
  return { wallet, transaction };
};

/**
 * Deduct funds from wallet (payment)
 */
const deductFunds = async (userId, amount, description = 'Payment', referenceId = null, referenceType = 'order') => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const amountToDeduct = parseFloat(amount);
  
  if (balanceBefore < amountToDeduct) {
    throw new Error('Insufficient wallet balance');
  }
  
  const balanceAfter = balanceBefore - amountToDeduct;
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'payment',
    amount: amountToDeduct,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
    reference_id: referenceId,
    reference_type: referenceType,
    status: 'completed'
  });
  
  return { wallet, transaction };
};

/**
 * Add earnings to delivery man wallet
 */
const addEarnings = async (userId, amount, description = 'Delivery earnings', referenceId = null) => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const balanceAfter = balanceBefore + parseFloat(amount);
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'earning',
    amount: parseFloat(amount),
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
    reference_id: referenceId,
    reference_type: 'order',
    status: 'completed'
  });
  
  return { wallet, transaction };
};

/**
 * Refund amount to customer wallet
 */
const refundToWallet = async (userId, amount, description = 'Order refund', referenceId = null) => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const balanceAfter = balanceBefore + parseFloat(amount);
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'refund',
    amount: parseFloat(amount),
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
    reference_id: referenceId,
    reference_type: 'order',
    status: 'completed'
  });
  
  return { wallet, transaction };
};

/**
 * Create withdrawal request
 */
const createWithdrawalRequest = async (userId, amount, bankDetails) => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const amountToWithdraw = parseFloat(amount);
  
  if (balanceBefore < amountToWithdraw) {
    throw new Error('Insufficient wallet balance for withdrawal');
  }
  
  const withdrawalRequest = await WithdrawalRequest.create({
    wallet_id: wallet.id,
    amount: amountToWithdraw,
    bank_account: bankDetails.bank_account,
    bank_name: bankDetails.bank_name,
    account_holder_name: bankDetails.account_holder_name,
    iban: bankDetails.iban,
    status: 'pending'
  });
  
  return withdrawalRequest;
};

/**
 * Approve withdrawal request
 */
const approveWithdrawal = async (withdrawalId, adminId) => {
  const withdrawalRequest = await WithdrawalRequest.findByPk(withdrawalId, {
    include: [{ model: Wallet, as: 'wallet' }]
  });
  
  if (!withdrawalRequest) {
    throw new Error('Withdrawal request not found');
  }
  
  if (withdrawalRequest.status !== 'pending') {
    throw new Error('Withdrawal request is not pending');
  }
  
  const wallet = withdrawalRequest.wallet;
  const balanceBefore = parseFloat(wallet.balance);
  const amountToWithdraw = parseFloat(withdrawalRequest.amount);
  
  if (balanceBefore < amountToWithdraw) {
    throw new Error('Insufficient wallet balance');
  }
  
  const balanceAfter = balanceBefore - amountToWithdraw;
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Update withdrawal request
  await withdrawalRequest.update({
    status: 'approved',
    processed_by: adminId,
    processed_at: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'withdrawal',
    amount: amountToWithdraw,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description: 'Withdrawal approved',
    reference_id: withdrawalId.toString(),
    reference_type: 'withdrawal',
    status: 'completed',
    created_by: adminId
  });
  
  return { withdrawalRequest, transaction };
};

/**
 * Reject withdrawal request
 */
const rejectWithdrawal = async (withdrawalId, adminId, rejectionReason) => {
  const withdrawalRequest = await WithdrawalRequest.findByPk(withdrawalId);
  
  if (!withdrawalRequest) {
    throw new Error('Withdrawal request not found');
  }
  
  if (withdrawalRequest.status !== 'pending') {
    throw new Error('Withdrawal request is not pending');
  }
  
  await withdrawalRequest.update({
    status: 'rejected',
    processed_by: adminId,
    processed_at: new Date(),
    rejection_reason: rejectionReason
  });
  
  return withdrawalRequest;
};

/**
 * Manual balance adjustment by admin
 */
const adjustBalance = async (userId, amount, description, adminId) => {
  const wallet = await getOrCreateWallet(userId);
  
  const balanceBefore = parseFloat(wallet.balance);
  const adjustmentAmount = parseFloat(amount);
  const balanceAfter = balanceBefore + adjustmentAmount;
  
  if (balanceAfter < 0) {
    throw new Error('Balance cannot be negative');
  }
  
  // Update wallet balance
  await wallet.update({
    balance: balanceAfter,
    last_updated: new Date()
  });
  
  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet_id: wallet.id,
    type: 'adjustment',
    amount: Math.abs(adjustmentAmount),
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
    reference_type: 'adjustment',
    status: 'completed',
    created_by: adminId
  });
  
  return { wallet, transaction };
};

/**
 * Get all withdrawal requests (for admin)
 */
const getAllWithdrawalRequests = async (page = 1, limit = 10, status = null) => {
  const where = {};
  if (status) {
    where.status = status;
  }
  
  const { count, rows } = await WithdrawalRequest.findAndCountAll({
    where,
    include: [
      {
        model: Wallet,
        as: 'wallet',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone_number']
          }
        ]
      },
      {
        model: User,
        as: 'processor',
        attributes: ['id', 'name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit
  });
  
  return {
    withdrawalRequests: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalRequests: count
  };
};

/**
 * Get wallet transactions history
 */
const getWalletTransactions = async (userId, page = 1, limit = 20, type = null) => {
  const wallet = await getOrCreateWallet(userId);
  
  const where = { wallet_id: wallet.id };
  if (type) {
    where.type = type;
  }
  
  const { count, rows } = await WalletTransaction.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit
  });
  
  return {
    transactions: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalTransactions: count
  };
};

module.exports = {
  getOrCreateWallet,
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
};
