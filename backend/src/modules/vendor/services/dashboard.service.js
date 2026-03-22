const { User, VendorInfo, Product, Order, OrderItem, Wallet } = require('../../../app/models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * ─────────────────────────────────────────────
 *  HELPERS
 * ─────────────────────────────────────────────
 */

const getDateRange = (timeframe) => {
  const now = new Date();

  switch (timeframe) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end: now };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case 'month':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
  }
};

/**
 * Get sales total for a specific date range
 */
const getSalesSum = async (productIds, startDate, endDate) => {
  const items = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [
      {
        model: Order,
        as: 'order',
        where: {
          status: 'delivered',
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [],
      },
    ],
    attributes: [[fn('SUM', literal('`OrderItem`.`price` * `OrderItem`.`quantity`')), 'total']],
    raw: true,
  });
  return parseFloat(items[0]?.total) || 0;
};

/**
 * Get total orders count for a date range
 */
const getOrdersCount = async (productIds, startDate, endDate) => {
  const items = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [
      {
        model: Order,
        as: 'order',
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: ['id'],
      },
    ],
    attributes: [],
    group: ['order.id'],
    raw: true,
  });
  return items.length;
};

/**
 * ─────────────────────────────────────────────
 *  MAIN DASHBOARD SUMMARY
 * ─────────────────────────────────────────────
 */
const getDashboardSummary = async (vendorId, timeframe = 'month') => {
  // Get vendor info
  const vendor = await VendorInfo.findOne({ where: { vendor_id: vendorId } });
  if (!vendor) throw new Error('Vendor not found');

  // Get all product IDs for this vendor
  const products = await Product.findAll({
    where: { vendor_id: vendorId },
    attributes: ['id'],
  });
  const productIds = products.map((p) => p.id);

  // Empty state
  if (productIds.length === 0) {
    return {
      salesSummary: { total: 0, totalOrders: 0, timeframe },
      orderStatus: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
      wallet: { balance: 0 },
      recentOrders: [],
      topProducts: [],
      chartData: [],
    };
  }

  // ─── Date range based on timeframe ───
  const { start, end } = getDateRange(timeframe);

  // ─── Sales summary for selected timeframe ───
  const totalSales = await getSalesSum(productIds, start, end);
  const totalOrders = await getOrdersCount(productIds, start, end);

  // ─── Order status counts (all time — shows full picture) ───
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const orderStatusCounts = {};

  for (const status of statuses) {
    const rows = await OrderItem.findAll({
      where: { product_id: { [Op.in]: productIds } },
      include: [
        {
          model: Order,
          as: 'order',
          where: { status },
          attributes: ['id'],
        },
      ],
      attributes: [],
      group: ['order.id'],
      raw: true,
    });
    orderStatusCounts[status] = rows.length;
  }

  // ─── Wallet balance ───
  let walletBalance = 0;
  try {
    const wallet = await Wallet.findOne({ where: { user_id: vendorId } });
    walletBalance = wallet ? parseFloat(wallet.balance) : 0;
  } catch (e) {
    walletBalance = 0;
  }

  // ─── Recent orders (last 5, scoped to timeframe) ───
  const recentOrderItems = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [
      {
        model: Order,
        as: 'order',
        where: {
          createdAt: { [Op.between]: [start, end] },
        },
        attributes: ['id', 'customer_id', 'status', 'total_price', 'payment_method', 'createdAt'],
        include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'phone_number'] }],
      },
    ],
    order: [[{ model: Order, as: 'order' }, 'createdAt', 'DESC']],
    limit: 20,
  });

  // Deduplicate by order id
  const seenOrderIds = new Set();
  const recentOrders = [];
  for (const item of recentOrderItems) {
    const o = item.order;
    if (o && !seenOrderIds.has(o.id)) {
      const createdAt = new Date(o.createdAt);
      const now = new Date();
      const diffMs = now - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo;
      if (diffMins < 1) timeAgo = 'Just now';
      else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      recentOrders.push({
        id: o.id,
        customer: o.customer?.name || `Customer #${o.customer_id}`,
        phone: o.customer?.phone_number || '',
        status: o.status,
        payment_method: o.payment_method,
        total: parseFloat(o.total_price),
        time: timeAgo,
        date: o.createdAt,
      });
      seenOrderIds.add(o.id);
    }
    if (recentOrders.length >= 5) break;
  }

  // ─── Top products (by quantity sold, scoped to timeframe) ───
  const topProductItems = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'image'],
      },
      {
        model: Order,
        as: 'order',
        where: {
          createdAt: { [Op.between]: [start, end] },
        },
        attributes: [],
      },
    ],
    attributes: [
      'product_id',
      [fn('SUM', col('`OrderItem`.`quantity`')), 'totalSold'],
      [fn('SUM', literal('`OrderItem`.`price` * `OrderItem`.`quantity`')), 'totalRevenue'],
    ],
    group: ['product_id', 'product.id', 'product.name', 'product.image'],
    order: [[fn('SUM', col('`OrderItem`.`quantity`')), 'DESC']],
    limit: 5,
    raw: true,
  });

  const topProducts = topProductItems.map((item) => ({
    id: item.product_id,
    name: item['product.name'],
    imgUrl: item['product.image'] || null,
    count: parseInt(item.totalSold, 10) || 0,
    revenue: parseFloat(item.totalRevenue) || 0,
  }));

  // ─── Last 7 days chart data (always last 7 days regardless of timeframe) ───
  const chartData = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const daySales = await getSalesSum(productIds, dayStart, dayEnd);

    chartData.push({
      label: dayLabels[dayStart.getDay()],
      value: daySales,
      date: dayStart.toISOString().split('T')[0],
    });
  }

  return {
    salesSummary: {
      total: totalSales,
      totalOrders,
      timeframe,
    },
    orderStatus: orderStatusCounts,
    wallet: { balance: walletBalance },
    recentOrders,
    topProducts,
    chartData,
  };
};

module.exports = { getDashboardSummary };