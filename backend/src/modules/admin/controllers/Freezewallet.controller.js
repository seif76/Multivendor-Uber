const {
  freezeWallet,
  unfreezeWallet,
  getAllWallets,
} = require('../services/Freezewallet.service');

/**
 * Freeze a user's wallet (Admin only)
 */
const freezeWalletController = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id;

    const result = await freezeWallet(parseInt(userId), adminId);

    res.status(200).json({
      success: true,
      message: 'Wallet frozen successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Unfreeze a user's wallet (Admin only)
 */
const unfreezeWalletController = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id;

    const result = await unfreezeWallet(parseInt(userId), adminId);

    res.status(200).json({
      success: true,
      message: 'Wallet unfrozen successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get all wallets with frozen status (Admin only)
 */
const getAllWalletsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const isFrozen =
      req.query.is_frozen === 'true'
        ? true
        : req.query.is_frozen === 'false'
        ? false
        : null;

    const result = await getAllWallets(page, limit, isFrozen);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  freezeWalletController,
  unfreezeWalletController,
  getAllWalletsController,
};