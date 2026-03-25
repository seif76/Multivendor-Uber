const { Order, Wallet, DebtTransaction } = require('../../../app/models');
const { Op } = require('sequelize');
const sequelize = require('../../../app/models').sequelize;
const { getOrCreateWallet } = require('../../wallet/services/wallet.service');

/**
 * ─────────────────────────────────────────────
 *  COD DEBT RECORDING
 *  Called when customer marks customer_delivery_status as 'payment_confirmed'
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
    await deliverymanWallet.update(
      { debt: debtAfter, last_updated: new Date() },
      { transaction: t }
    );

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
 *  SETTLE DEBT BY AMOUNT
 *  Admin enters amount the deliveryman paid
 *  Settles pending debt transactions oldest-first
 *  until the amount is consumed
 *
 *  Flow:
 *    Deliveryman wallet.debt     →  DECREASED by paid amount
 *    DebtTransaction(s).status   →  'settled' (oldest first, until amount runs out)
 * ─────────────────────────────────────────────
 */
const settleDebtByAmount = async (deliverymanId, paidAmount, adminId) => {
  const deliverymanWallet = await Wallet.findOne({
    where: { user_id: deliverymanId },
  });

  if (!deliverymanWallet) {
    throw new Error('Deliveryman wallet not found');
  }

  const currentDebt = parseFloat(deliverymanWallet.debt || 0);

  if (currentDebt <= 0) {
    throw new Error('This deliveryman has no outstanding debt');
  }

  const amountToPay = parseFloat(paidAmount);

  if (amountToPay <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  if (amountToPay > currentDebt) {
    throw new Error(
      `Payment amount ($${amountToPay}) exceeds total debt ($${currentDebt.toFixed(2)})`
    );
  }

  // Fetch pending debts oldest first
  const pendingDebts = await DebtTransaction.findAll({
    where: {
      deliveryman_id: deliverymanId,
      status: 'pending',
    },
    order: [['createdAt', 'ASC']],
  });

  if (pendingDebts.length === 0) {
    throw new Error('No pending debt records found for this deliveryman');
  }

  const t = await sequelize.transaction();

  try {
    let remaining = amountToPay;
    const settledIds = [];

    // Settle oldest debts first until amount is consumed
    for (const debt of pendingDebts) {
      if (remaining <= 0) break;

      const debtAmount = parseFloat(debt.amount);

      if (remaining >= debtAmount) {
        // Fully settle this debt record
        await debt.update(
          { status: 'settled', settled_at: new Date() },
          { transaction: t }
        );
        settledIds.push(debt.id);
        remaining = parseFloat((remaining - debtAmount).toFixed(2));
      } else {
        // Partially paid — split into settled + remaining
        // Mark original as settled for the paid portion
        await debt.update(
          { status: 'settled', settled_at: new Date(), amount: remaining },
          { transaction: t }
        );
        settledIds.push(debt.id);

        // Create a new pending record for the remaining unpaid portion
        const leftover = parseFloat((debtAmount - remaining).toFixed(2));
        const newDebtBefore = parseFloat((currentDebt - amountToPay).toFixed(2));
        const newDebtAfter = newDebtBefore;

        await DebtTransaction.create(
          {
            wallet_id: deliverymanWallet.id,
            deliveryman_id: deliverymanId,
            order_id: debt.order_id,
            amount: leftover,
            debt_before: parseFloat(debt.debt_before),
            debt_after: newDebtAfter,
            status: 'pending',
            description: `Remaining debt for order #${debt.order_id} after partial settlement`,
            settled_at: null,
          },
          { transaction: t }
        );

        remaining = 0;
      }
    }

    // Update wallet debt
    const newDebt = parseFloat((currentDebt - amountToPay).toFixed(2));

    await deliverymanWallet.update(
      { debt: newDebt < 0 ? 0 : newDebt, last_updated: new Date() },
      { transaction: t }
    );

    await t.commit();

    console.log(
      `Admin #${adminId} settled $${amountToPay} debt for deliveryman #${deliverymanId}. Remaining debt: $${newDebt}`
    );

    return {
      settledAmount: amountToPay,
      remainingDebt: newDebt < 0 ? 0 : newDebt,
      settledRecords: settledIds.length,
      deliverymanWallet,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * ─────────────────────────────────────────────
 *  SETTLE ALL DEBT
 *  Clears all pending debt for a deliveryman at once
 *
 *  Flow:
 *    Deliveryman wallet.debt     →  SET TO 0
 *    All pending DebtTransactions →  'settled'
 * ─────────────────────────────────────────────
 */
const settleAllDebt = async (deliverymanId, adminId) => {
  const deliverymanWallet = await Wallet.findOne({
    where: { user_id: deliverymanId },
  });

  if (!deliverymanWallet) {
    throw new Error('Deliveryman wallet not found');
  }

  const currentDebt = parseFloat(deliverymanWallet.debt || 0);

  if (currentDebt <= 0) {
    throw new Error('This deliveryman has no outstanding debt');
  }

  const pendingDebts = await DebtTransaction.findAll({
    where: {
      deliveryman_id: deliverymanId,
      status: 'pending',
    },
  });

  if (pendingDebts.length === 0) {
    throw new Error('No pending debt records found for this deliveryman');
  }

  const t = await sequelize.transaction();

  try {
    // Settle all pending records
    await DebtTransaction.update(
      { status: 'settled', settled_at: new Date() },
      {
        where: {
          deliveryman_id: deliverymanId,
          status: 'pending',
        },
        transaction: t,
      }
    );

    // Clear wallet debt
    await deliverymanWallet.update(
      { debt: 0, last_updated: new Date() },
      { transaction: t }
    );

    await t.commit();

    console.log(
      `Admin #${adminId} settled ALL debt ($${currentDebt}) for deliveryman #${deliverymanId}`
    );

    return {
      settledAmount: currentDebt,
      remainingDebt: 0,
      settledRecords: pendingDebts.length,
      deliverymanWallet,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * ─────────────────────────────────────────────
 *  GET PENDING DEBTS FOR A DELIVERYMAN
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
  settleDebtByAmount,
  settleAllDebt,
  getDeliverymanPendingDebts,
};