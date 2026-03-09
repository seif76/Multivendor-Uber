const { Order,WalletTransaction} = require('../../../app/models');
//const { Op } = require('sequelize');
const sequelize = require('../../../app/models').sequelize; // ← ADD THIS
const {getOrCreateWallet} = require('../../wallet/services/wallet.service');
const releasePaymentToVendor = async (orderId) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.payment_method !== 'wallet') {
    throw new Error('Order payment method is not wallet');
  }

  // Prevent double release
  const alreadyReleased = await WalletTransaction.findOne({
    where: {
      reference_id: orderId.toString(),
      reference_type: 'order',
      category: 'earning',
    },
  });

  if (alreadyReleased) {
    throw new Error('Payment has already been released to vendor for this order');
  }

  // Confirm customer wallet was deducted first
  const originalPayment = await WalletTransaction.findOne({
    where: {
      reference_id: orderId.toString(),
      reference_type: 'order',
      category: 'payment',
    },
  });

  if (!originalPayment) {
    throw new Error('No wallet payment found for this order');
  }

  const vendorWallet = await getOrCreateWallet(order.vendor_id);

  // Use vendor_fee — product subtotal only
  // Does NOT include delivery_fee or service_fee
  const amount = parseFloat(order.vendor_fee);

  const balanceBefore = parseFloat(vendorWallet.balance);
  const balanceAfter = balanceBefore + amount;

  const t = await sequelize.transaction();

  try {
    await vendorWallet.update(
      { balance: balanceAfter, last_updated: new Date() },
      { transaction: t }
    );

    const vendorTransaction = await WalletTransaction.create(
      {
        wallet_id: vendorWallet.id,
        category: 'earning',
        direction:'incoming',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Payment received for order #${orderId}`,
        reference_id: orderId.toString(),
        reference_type: 'order',
        status: 'completed',
      },
      { transaction: t }
    );

    await t.commit();

    return { vendorWallet, vendorTransaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
    module.exports = {
  releasePaymentToVendor,
  
}