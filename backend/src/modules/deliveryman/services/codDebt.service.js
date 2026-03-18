const { Order, Wallet, DebtTransaction } = require('../../../app/models');
const sequelize = require('../../../app/models').sequelize;
const { getOrCreateWallet } = require('../../wallet/services/wallet.service');

/**
 * ─────────────────────────────────────────────
 *  COD DEBT RECORDING
 *  Called when customer marks customer_delivery_status as 'payment_confirmed'
 *  on a cash order
 *
 *  The deliveryman collected total_price cash from the customer.
 *  He already paid vendor_fee to the vendor before picking up.
 *  Platform records this as a debt on his wallet.
 *
 *  Flow:
 *    Deliveryman wallet.debt  →  INCREASED (+vendor_fee)
 *    DebtTransaction          →  CREATED (status: pending)
 * ─────────────────────────────────────────────
 */

  const recordCodDebtOnDeliveryman = async (orderId, order) => {
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.payment_method !== 'cash') {
    throw new Error('Order payment method is not cash');
  }

  if (!order.deliveryman_id) {
    throw new Error('No delivery man assigned to this order');
  }

  // Prevent duplicate debt recording
  const alreadyRecorded = await DebtTransaction.findOne({
    where: { order_id: orderId },
  });

  if (alreadyRecorded) {
    throw new Error('COD debt has already been recorded for this order');
  }

  const deliverymanWallet = await getOrCreateWallet(order.deliveryman_id);

  const debtAmount = parseFloat(order.service_fee);
  const debtBefore = parseFloat(deliverymanWallet.debt || 0);
  const debtAfter = parseFloat((debtBefore + debtAmount).toFixed(2));

  const t = await sequelize.transaction();

  try {
    // Increase debt on deliveryman wallet
    await deliverymanWallet.update(
      { debt: debtAfter, last_updated: new Date() },
      { transaction: t }
    );

    // Create debt transaction record
    const debtTransaction = await DebtTransaction.create(
      {
        wallet_id: deliverymanWallet.id,
        deliveryman_id: order.deliveryman_id,
        order_id: orderId,
        amount: debtAmount,
        debt_before: debtBefore,
        debt_after: debtAfter,
        status: 'pending',
        description: `COD debt for order #${orderId} — collected cash from customer, vendor share owed to platform`,
        settled_at: null,
      },
      { transaction: t }
    );

    await t.commit();

    console.log(`COD debt $${debtAmount} recorded on deliveryman #${order.deliveryman_id} wallet for order #${orderId}`);

    return { deliverymanWallet, debtTransaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * ─────────────────────────────────────────────
 *  COD DEBT SETTLEMENT
 *  Called by admin when deliveryman submits collected cash
 *
 *  Flow:
 *    Deliveryman wallet.debt  →  DECREASED (-vendor_fee)
 *    DebtTransaction.status   →  'settled'
 * ─────────────────────────────────────────────
 */
const settleCodDebt = async (orderId, adminId) => {
  const debtTransaction = await DebtTransaction.findOne({
    where: { order_id: orderId, status: 'pending' },
  });

  if (!debtTransaction) {
    throw new Error('No pending COD debt found for this order');
  }

  const deliverymanWallet = await Wallet.findByPk(debtTransaction.wallet_id);

  if (!deliverymanWallet) {
    throw new Error('Deliveryman wallet not found');
  }

  const debtAmount = parseFloat(debtTransaction.amount);
  const debtBefore = parseFloat(deliverymanWallet.debt || 0);
  const debtAfter = parseFloat((debtBefore - debtAmount).toFixed(2));

  const t = await sequelize.transaction();

  try {
    // Decrease debt on deliveryman wallet
    await deliverymanWallet.update(
      { debt: debtAfter < 0 ? 0 : debtAfter, last_updated: new Date() },
      { transaction: t }
    );

    // Mark debt transaction as settled
    await debtTransaction.update(
      {
        status: 'settled',
        settled_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    console.log(`COD debt $${debtAmount} settled for order #${orderId} by admin #${adminId}`);

    return { deliverymanWallet, debtTransaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * ─────────────────────────────────────────────
 *  GET PENDING DEBTS FOR A DELIVERYMAN
 *  For admin dashboard
 * ─────────────────────────────────────────────
 */
const getDeliverymanPendingDebts = async (deliverymanId) => {
  const deliverymanWallet = await getOrCreateWallet(deliverymanId);

  const pendingDebts = await DebtTransaction.findAll({
    where: {
      deliveryman_id: deliverymanId,
      status: 'pending',
    },
    order: [['createdAt', 'DESC']],
  });

  return {
    deliverymanWallet,
    totalDebt: parseFloat(deliverymanWallet.debt || 0).toFixed(2),
    pendingDebts,
    pendingCount: pendingDebts.length,
  };
};

module.exports = {
  recordCodDebtOnDeliveryman,
  settleCodDebt,
  getDeliverymanPendingDebts,
};