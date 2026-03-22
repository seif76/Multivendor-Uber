const { adminWallet, WalletTransaction, Wallet, DebtTransaction, User, Order } = require('../../../app/models');
const { Op } = require('sequelize');

/**
 * ─────────────────────────────────────────────
 *  Get admin wallet balance (service fees collected)
 * ─────────────────────────────────────────────
 */
const getAdminWalletBalance = async () => {
  const wallet = await adminWallet.findOne();

  if (!wallet) {
    throw new Error('Admin wallet not found');
  }

  return wallet;
};

/**
 * ─────────────────────────────────────────────
 *  Get all wallet transactions (paginated)
 *  For admin to see all money movements across platform
 * ─────────────────────────────────────────────
 */
const getAllWalletTransactions = async (page = 1, limit = 20, category = null) => {
  const where = {};
  if (category) where.category = category;

  const { count, rows } = await WalletTransaction.findAndCountAll({
    where,
    include: [
      {
        model: Wallet,
        as: 'wallet',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone_number'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    transactions: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalTransactions: count,
  };
};

/**
 * ─────────────────────────────────────────────
 *  Get all deliveryman COD debts
 *  Shows all pending and settled debts across all deliverymen
 * ─────────────────────────────────────────────
 */
const getAllCodDebts = async (page = 1, limit = 20, status = null) => {
  const where = {};
  if (status) where.status = status;

  const { count, rows } = await DebtTransaction.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'deliveryman',
        attributes: ['id', 'name', 'email', 'phone_number'],
      },
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'total_price', 'vendor_fee', 'deliveryman_fee', 'service_fee', 'payment_method', 'status'],
      },
      {
        model: Wallet,
        as: 'wallet',
        attributes: ['id', 'balance', 'debt'],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    debts: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalDebts: count,
  };
};

/**
 * ─────────────────────────────────────────────
 *  Get COD debt details per deliveryman
 *  Shows all debts for a specific deliveryman
 * ─────────────────────────────────────────────
 */
const getDeliverymanDebtDetails = async (deliverymanId, page = 1, limit = 20) => {
  const deliveryman = await User.findByPk(deliverymanId, {
    attributes: ['id', 'name', 'email', 'phone_number'],
  });

  if (!deliveryman) {
    throw new Error('Deliveryman not found');
  }

  const wallet = await Wallet.findOne({ where: { user_id: deliverymanId } });

  const { count, rows } = await DebtTransaction.findAndCountAll({
    where: { deliveryman_id: deliverymanId },
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'total_price', 'vendor_fee', 'deliveryman_fee', 'service_fee', 'payment_method', 'status', 'createdAt'],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });

  const totalPending = rows
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const totalSettled = rows
    .filter((d) => d.status === 'settled')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return {
    deliveryman,
    wallet: {
      balance: parseFloat(wallet?.balance || 0).toFixed(2),
      debt: parseFloat(wallet?.debt || 0).toFixed(2),
    },
    debts: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalDebts: count,
    totalPending: totalPending.toFixed(2),
    totalSettled: totalSettled.toFixed(2),
  };
};

/**
 * ─────────────────────────────────────────────
 *  Get all deliverymen with their debt summary
 *  For the main COD debts overview table
 * ─────────────────────────────────────────────
 */
const getAllDeliverymenDebtSummary = async () => {
  const deliverymen = await User.findAll({
    where: { deliveryman_status: 'Active' },
    attributes: ['id', 'name', 'email', 'phone_number'],
    include: [
      {
        model: Wallet,
        as: 'wallet',
        attributes: ['id', 'balance', 'debt'],
      },
    ],
  });

  return deliverymen.map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone_number: d.phone_number,
    balance: parseFloat(d.wallet?.balance || 0).toFixed(2),
    debt: parseFloat(d.wallet?.debt || 0).toFixed(2),
  }));
};

module.exports = {
  getAdminWalletBalance,
  getAllWalletTransactions,
  getAllCodDebts,
  getDeliverymanDebtDetails,
  getAllDeliverymenDebtSummary,
};