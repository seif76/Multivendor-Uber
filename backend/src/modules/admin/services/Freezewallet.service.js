const { Wallet, User } = require('../../../app/models');

/**
 * ─────────────────────────────────────────────
 *  FREEZE WALLET
 *  Prevents the user from making payments or withdrawals
 * ─────────────────────────────────────────────
 */
const freezeWallet = async (userId, adminId) => {
  const wallet = await Wallet.findOne({ where: { user_id: userId } });

  if (!wallet) {
    throw new Error('Wallet not found for this user');
  }

  if (wallet.is_frozen) {
    throw new Error('Wallet is already frozen');
  }

  await wallet.update({
    is_frozen: true,
    last_updated: new Date(),
  });

  console.log(`Wallet frozen for user #${userId} by admin #${adminId}`);

  return wallet;
};

/**
 * ─────────────────────────────────────────────
 *  UNFREEZE WALLET
 *  Restores full wallet functionality
 * ─────────────────────────────────────────────
 */
const unfreezeWallet = async (userId, adminId) => {
  const wallet = await Wallet.findOne({ where: { user_id: userId } });

  if (!wallet) {
    throw new Error('Wallet not found for this user');
  }

  if (!wallet.is_frozen) {
    throw new Error('Wallet is not frozen');
  }

  await wallet.update({
    is_frozen: false,
    last_updated: new Date(),
  });

  console.log(`Wallet unfrozen for user #${userId} by admin #${adminId}`);

  return wallet;
};

/**
 * ─────────────────────────────────────────────
 *  GET ALL WALLETS
 *  For admin wallet management page
 *  Returns all wallets with user info and frozen status
 * ─────────────────────────────────────────────
 */
const getAllWallets = async (page = 1, limit = 20, isFrozen = null) => {
  const where = {};
  if (isFrozen !== null) where.is_frozen = isFrozen;

  const { count, rows } = await Wallet.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone_number', 'customer_status', 'vendor_status', 'deliveryman_status'],
      },
    ],
    order: [['last_updated', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  });

  return {
    wallets: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalWallets: count,
  };
};

module.exports = {
  freezeWallet,
  unfreezeWallet,
  getAllWallets,
};