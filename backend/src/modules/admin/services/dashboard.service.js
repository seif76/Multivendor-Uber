const { User, VendorInfo, Order, OrderItem, Product, Wallet, WalletTransaction, WithdrawalRequest } = require('../../../app/models');
const { Op, fn, col, literal } = require('sequelize');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

const getDateRange = (range) => {
  const now = new Date();
  let startDate;
  switch (range) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { startDate, endDate: now };
};

// ─────────────────────────────────────────────
//  1. OVERVIEW STATS
// ─────────────────────────────────────────────

const getOverviewStats = async () => {
  const [
    totalCustomers, totalVendors, totalDeliverymen,
    totalOrders, pendingOrders, deliveredOrders, cancelledOrders,
    walletStats, withdrawalStats,
  ] = await Promise.all([
    User.count({ where: { customer_status: { [Op.ne]: 'none' } } }),
    User.count({ where: { vendor_status: { [Op.ne]: 'none' } } }),
    User.count({ where: { deliveryman_status: { [Op.ne]: 'none' } } }),
    Order.count(),
    Order.count({ where: { status: 'pending' } }),
    Order.count({ where: { status: 'delivered' } }),
    Order.count({ where: { status: 'cancelled' } }),
    Wallet.findOne({
      attributes: [
        [fn('SUM', col('balance')), 'totalBalance'],
        [fn('SUM', col('debt')), 'totalDebt'],
      ],
      raw: true,
    }),
    WithdrawalRequest.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      where: { status: 'pending' },
      raw: true,
    }),
  ]);

  // Total revenue from delivered orders (sum of vendor_fee + service_fee)
  const revenueResult = await Order.findOne({
    attributes: [
      [fn('SUM', col('total_price')), 'totalRevenue'],
      [fn('SUM', col('service_fee')), 'totalServiceFees'],
      [fn('SUM', col('vendor_fee')), 'totalVendorFees'],
      [fn('SUM', col('deliveryman_fee')), 'totalDeliveryFees'],
    ],
    where: { status: 'delivered' },
    raw: true,
  });

  return {
    users: { totalCustomers, totalVendors, totalDeliverymen },
    orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
    revenue: {
      totalRevenue: parseFloat(revenueResult?.totalRevenue || 0).toFixed(2),
      totalServiceFees: parseFloat(revenueResult?.totalServiceFees || 0).toFixed(2),
      totalVendorFees: parseFloat(revenueResult?.totalVendorFees || 0).toFixed(2),
      totalDeliveryFees: parseFloat(revenueResult?.totalDeliveryFees || 0).toFixed(2),
    },
    wallets: {
      totalBalance: parseFloat(walletStats?.totalBalance || 0).toFixed(2),
      totalDebt: parseFloat(walletStats?.totalDebt || 0).toFixed(2),
    },
    withdrawals: {
      pendingCount: parseInt(withdrawalStats?.total || 0),
      pendingAmount: parseFloat(withdrawalStats?.totalAmount || 0).toFixed(2),
    },
  };
};

// ─────────────────────────────────────────────
//  2. REVENUE OVER TIME
// ─────────────────────────────────────────────

const getRevenueOverTime = async (range = 'month') => {
  const { startDate } = getDateRange(range);

  let groupFormat;
  if (range === 'week') groupFormat = '%Y-%m-%d';
  else if (range === 'month') groupFormat = '%Y-%m-%d';
  else groupFormat = '%Y-%m';

  const results = await Order.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('createdAt'), groupFormat), 'date'],
      [fn('SUM', col('total_price')), 'revenue'],
      [fn('SUM', col('service_fee')), 'serviceFees'],
      [fn('COUNT', col('id')), 'orderCount'],
    ],
    where: {
      status: 'delivered',
      createdAt: { [Op.gte]: startDate },
    },
    group: [fn('DATE_FORMAT', col('createdAt'), groupFormat)],
    order: [[fn('DATE_FORMAT', col('createdAt'), groupFormat), 'ASC']],
    raw: true,
  });

  return results.map(r => ({
    date: r.date,
    revenue: parseFloat(r.revenue || 0).toFixed(2),
    serviceFees: parseFloat(r.serviceFees || 0).toFixed(2),
    orderCount: parseInt(r.orderCount || 0),
  }));
};

// ─────────────────────────────────────────────
//  3. ORDERS BREAKDOWN
// ─────────────────────────────────────────────

const getOrdersBreakdown = async (range = 'month') => {
  const { startDate } = getDateRange(range);
  const where = { createdAt: { [Op.gte]: startDate } };

  const [byStatus, byPayment] = await Promise.all([
    Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      where,
      group: ['status'],
      raw: true,
    }),
    Order.findAll({
      attributes: ['payment_method', [fn('COUNT', col('id')), 'count']],
      where,
      group: ['payment_method'],
      raw: true,
    }),
  ]);

  return {
    byStatus: byStatus.map(r => ({ status: r.status, count: parseInt(r.count) })),
    byPayment: byPayment.map(r => ({ method: r.payment_method, count: parseInt(r.count) })),
  };
};

// ─────────────────────────────────────────────
//  4. TOP VENDORS
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  4. TOP VENDORS
// ─────────────────────────────────────────────

const getTopVendors = async (limit = 10, range = 'month') => {
  const { startDate } = getDateRange(range);
  
  const results = await Order.findAll({
    attributes: [
      'vendor_id',
      [fn('COUNT', col('Order.id')), 'orderCount'],
      [fn('SUM', col('vendor_fee')), 'totalEarnings'],
      [fn('SUM', col('total_price')), 'totalRevenue'],
    ],
    where: {
      status: 'delivered',
      createdAt: { [Op.gte]: startDate },
    },
    include: [
      {
        model: VendorInfo,
        as: 'vendor',
        attributes: ['shop_name', 'vendor_id', 'phone_number'],
      },
    ],
    group: ['vendor_id'],
    order: [[fn('SUM', col('vendor_fee')), 'DESC']],
    limit: parseInt(limit),
  });
const vendorIds = results.map(r => r.get({ plain: true }).vendor_id).filter(Boolean);

const users = await User.findAll({
  where: { id: vendorIds },
  attributes: ['id', 'name', 'email', 'phone_number'],
});

const usersMap = {};
users.forEach(u => { usersMap[u.id] = u.get({ plain: true }); });

return results.map(row => {
  const r = row.get({ plain: true });
  const user = usersMap[r.vendor_id] || {}; // ← use r.vendor_id directly
  return {
    vendorId: r.vendor_id,
    name: r.vendor?.shop_name || user?.name || `Vendor #${r.vendor_id}`,
    email: user?.email || '—',
    phone: user?.phone_number || '—',
    orderCount: parseInt(r.orderCount || 0),
    totalEarnings: parseFloat(r.totalEarnings || 0).toFixed(2),
    totalRevenue: parseFloat(r.totalRevenue || 0).toFixed(2),
  };
})};
//};
// ─────────────────────────────────────────────
//  5. TOP PRODUCTS
// ─────────────────────────────────────────────

const getTopProducts = async (limit = 10, range = 'month') => {
  const { startDate } = getDateRange(range);

  const results = await OrderItem.findAll({
    attributes: [
      'product_id',
      [fn('COUNT', col('OrderItem.id')), 'timesSold'],
      [fn('SUM', col('OrderItem.quantity')), 'totalQuantity'],
      [fn('SUM', col('OrderItem.price')), 'totalRevenue'],
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image'],
      },
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: 'delivered',
          createdAt: { [Op.gte]: startDate },
        },
      },
    ],
    group: ['product_id'],
    order: [[fn('SUM', col('OrderItem.quantity')), 'DESC']],
    limit: parseInt(limit),
  });

  return results.map(r => ({
    productId: r.product_id,
    name: r.product?.name || '—',
    price: parseFloat(r.product?.price || 0).toFixed(2),
    image: r.product?.image || null,
    timesSold: parseInt(r.dataValues.timesSold),
    totalQuantity: parseInt(r.dataValues.totalQuantity),
    totalRevenue: parseFloat(r.dataValues.totalRevenue || 0).toFixed(2),
  }));
};

// ─────────────────────────────────────────────
//  6. DELIVERYMAN PERFORMANCE
// ─────────────────────────────────────────────

const getDeliverymanPerformance = async (limit = 10, range = 'month') => {
  const { startDate } = getDateRange(range);

  const results = await Order.findAll({
    attributes: [
      'deliveryman_id',
      [fn('COUNT', col('Order.id')), 'totalDeliveries'],
      [fn('SUM', col('deliveryman_fee')), 'totalEarnings'],
      [fn('COUNT', literal("CASE WHEN status = 'delivered' THEN 1 END")), 'completedDeliveries'],
      [fn('COUNT', literal("CASE WHEN status = 'cancelled' THEN 1 END")), 'cancelledDeliveries'],
    ],
    where: {
      deliveryman_id: { [Op.ne]: null },
      createdAt: { [Op.gte]: startDate },
    },
    include: [
      {
        model: User,
        as: 'deliveryman',
        attributes: ['id', 'name', 'email', 'phone_number', 'rating'],
      },
    ],
    group: ['deliveryman_id'],
    order: [[fn('COUNT', col('Order.id')), 'DESC']],
    limit: parseInt(limit),
  });

  return results.map(r => ({
    deliverymanId: r.deliveryman_id,
    name: r.deliveryman?.name || '—',
    email: r.deliveryman?.email || '—',
    phone: r.deliveryman?.phone_number || '—',
    rating: parseFloat(r.deliveryman?.rating || 0).toFixed(1),
    totalDeliveries: parseInt(r.dataValues.totalDeliveries),
    completedDeliveries: parseInt(r.dataValues.completedDeliveries),
    cancelledDeliveries: parseInt(r.dataValues.cancelledDeliveries),
    totalEarnings: parseFloat(r.dataValues.totalEarnings || 0).toFixed(2),
  }));
};

// ─────────────────────────────────────────────
//  7. WALLET & WITHDRAWAL STATS
// ─────────────────────────────────────────────

const getWalletStats = async (range = 'month') => {
  const { startDate } = getDateRange(range);

  const [txStats, withdrawalByStatus] = await Promise.all([
    WalletTransaction.findAll({
      attributes: [
        'category',
        'direction',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['category', 'direction'],
      raw: true,
    }),
    WithdrawalRequest.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['status'],
      raw: true,
    }),
  ]);

  return {
    transactions: txStats.map(r => ({
      category: r.category,
      direction: r.direction,
      count: parseInt(r.count),
      totalAmount: parseFloat(r.totalAmount || 0).toFixed(2),
    })),
    withdrawals: withdrawalByStatus.map(r => ({
      status: r.status,
      count: parseInt(r.count),
      totalAmount: parseFloat(r.totalAmount || 0).toFixed(2),
    })),
  };
};

module.exports = {
  getOverviewStats,
  getRevenueOverTime,
  getOrdersBreakdown,
  getTopVendors,
  getTopProducts,
  getDeliverymanPerformance,
  getWalletStats,
};