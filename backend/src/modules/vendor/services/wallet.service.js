const { Order,WalletTransaction,adminWallet} = require('../../../app/models');
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


const releaseDeliveryFeeToDeliveryman = async (orderId) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.deliveryman_id) {
    throw new Error('No delivery man assigned to this order');
  }

  // Prevent double release
  const alreadyReleased = await WalletTransaction.findOne({
    where: {
      reference_id: orderId.toString(),
      reference_type: 'order',
      category: 'earning',
      wallet_id: (await getOrCreateWallet(order.deliveryman_id)).id,
    },
  });

  if (alreadyReleased) {
    throw new Error('Delivery fee has already been released for this order');
  }

  const deliverymanWallet = await getOrCreateWallet(order.deliveryman_id);

  const deliveryFee = parseFloat(order.deliveryman_fee);
  const balanceBefore = parseFloat(deliverymanWallet.balance);
  const balanceAfter = balanceBefore + deliveryFee;

  const t = await sequelize.transaction();

  try {
    await deliverymanWallet.update(
      { balance: balanceAfter, last_updated: new Date() },
      { transaction: t }
    );

    const deliverymanTransaction = await WalletTransaction.create(
      {
        wallet_id: deliverymanWallet.id,
        category: 'earning',
        direction: 'incoming',
        amount: deliveryFee,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Delivery fee for order #${orderId}`,
        reference_id: orderId.toString(),
        reference_type: 'order',
        status: 'completed',
      },
      { transaction: t }
    );

    //await t.commit();

    //return { deliverymanWallet, deliverymanTransaction };

    let adminWalletRecord = null;

    if (order.payment_method === 'wallet') {
      const serviceFee = parseFloat(order.service_fee);

      if (serviceFee > 0) {
        adminWalletRecord = await adminWallet.findOne({ transaction: t });

        if (!adminWalletRecord) {
          throw new Error('Admin wallet not found. Please run the admin wallet sync first.');
        }

        const adminBalanceBefore = parseFloat(adminWalletRecord.balance);
        const adminBalanceAfter = adminBalanceBefore + serviceFee;

        await adminWalletRecord.update(
          { balance: adminBalanceAfter, last_updated: new Date() },
          { transaction: t }
        );
        // this is for the wrong assocciation in the admin so that wallet_id her needs to be in table wallets
        // needs to be added a table adminwallettransactions
        // await WalletTransaction.create(
        //   {
        //     wallet_id: adminWalletRecord.id,
        //     category: 'earning',
        //     direction: 'incoming',
        //     amount: serviceFee,
        //     balance_before: adminBalanceBefore,
        //     balance_after: adminBalanceAfter,
        //     description: `Service fee for order #${orderId}`,
        //     reference_id: orderId.toString(),
        //     reference_type: 'order',
        //     status: 'completed',
        //   },
        //   { transaction: t }
        // );

        console.log(`✅ Service fee $${serviceFee} credited to admin wallet for order #${orderId}`);
      }
    }

    await t.commit();

    return { deliverymanWallet, deliverymanTransaction, adminWallet: adminWalletRecord };


  } catch (error) {
    await t.rollback();
    throw error;
  }
};

  module.exports = {
  releasePaymentToVendor,
  releaseDeliveryFeeToDeliveryman,
}