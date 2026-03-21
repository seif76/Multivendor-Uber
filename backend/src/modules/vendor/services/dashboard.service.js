const { User, VendorInfo, Product, Order, OrderItem } = require('../../../app/models');
const { Op, fn, col, literal } = require('sequelize');

async function getDashboardSummary(vendorId) {
  // Get vendor info
  const vendor = await VendorInfo.findOne({ where: { vendor_id: vendorId } });
  if (!vendor) throw new Error('Vendor not found');

  // Get all product IDs for this vendor
  const products = await Product.findAll({ where: { vendor_id: vendorId }, attributes: ['id'] });
  const productIds = products.map(p => p.id);
  if (productIds.length === 0) {
    // No products, return empty stats
    return {
      salesSummary: { today: 0, week: 0, month: 0 },
      orderStatus: { Pending: 0, Processing: 0, Delivered: 0, Cancelled: 0 },
      wallet: { balance: 0, recentPayouts: [] },
      recentOrders: [],
      topProducts: [],
      notifications: [],
      reviews: [],
    };
  }

  // Date ranges
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Helper: get sales for a date range
  async function getSalesSum(startDate) {
    const items = await OrderItem.findAll({
      where: { product_id: { [Op.in]: productIds } },
      include: [{
        model: Order,
        as: 'order',
        where: {
          status: 'delivered',
          createdAt: { [Op.gte]: startDate },
        },
        attributes: [],
      }],
      attributes: [[fn('SUM', literal('price * quantity')), 'total']],
      raw: true,
    });
    return parseFloat(items[0].total) || 0;
  }

  const salesToday = await getSalesSum(startOfDay);
  const salesWeek = await getSalesSum(startOfWeek);
  const salesMonth = await getSalesSum(startOfMonth);

  // Order status counts (unique orders by status)
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const orderStatusCounts = {};
  for (const status of statuses) {
    const orderIds = await OrderItem.findAll({
      where: { product_id: { [Op.in]: productIds } },
      include: [{
        model: Order,
        as: 'order',
        where: { status },
        attributes: ['id'],
      }],
      attributes: [],
      group: ['order.id'],
      raw: true,
    });
    orderStatusCounts[status.charAt(0).toUpperCase() + status.slice(1)] = orderIds.length;
  }

  // Wallet
  let walletBalance = 0;
  let recentPayouts = [];
  try {
    const { Wallet } = require('../../../app/models');
    const wallet = await Wallet.findOne({ where: { user_id: vendorId } });
    walletBalance = wallet ? wallet.balance : 0;
    // No payout model, so leave recentPayouts empty
  } catch (e) {
    walletBalance = 0;
    recentPayouts = [];
  }

  // Recent orders (unique orders, sorted by date, with at least one item for this vendor)
  const recentOrderItems = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [{
      model: Order,
      as: 'order',
      attributes: ['id', 'customer_id', 'status', 'total_price', 'createdAt'],
      include: [{ model: User, as: 'customer', attributes: ['name'] }],
    }],
    order: [[{ model: Order, as: 'order' }, 'createdAt', 'DESC']],
    limit: 10,
  });
  // Deduplicate by order id
  const seenOrderIds = new Set();
  const recentOrders = [];
  for (const item of recentOrderItems) {
    const o = item.order;
    if (o && !seenOrderIds.has(o.id)) {
      recentOrders.push({
        id: o.id,
        customer: o.customer ? o.customer.name : o.customer_id,
        status: o.status,
        total: o.total_price,
        date: o.createdAt,
      });
      seenOrderIds.add(o.id);
    }
    if (recentOrders.length >= 5) break;
  }

  // Top products (by sales quantity)
  const topProductItems = await OrderItem.findAll({
    where: { product_id: { [Op.in]: productIds } },
    include: [{ model: Product, as: 'product', attributes: ['name'] }],
    attributes: ['product_id', [fn('SUM', col('quantity')), 'totalSold']],
    group: ['product_id', 'product.name'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    limit: 5,
    raw: true,
  });
  const topProducts = topProductItems.map(item => ({
    id: item.product_id,
    name: item['product.name'],
    sales: parseInt(item.totalSold, 10),
  }));

  // Notifications (dummy)
  const notifications = [
    { id: 1, message: 'New order received!', date: '2024-06-02' },
    { id: 2, message: 'Payout approved.', date: '2024-06-01' },
  ];

  // Reviews (dummy)
  const reviews = [
    { id: 1, product: 'Product A', rating: 5, comment: 'Great quality!' },
    { id: 2, product: 'Product B', rating: 4, comment: 'Good value.' },
  ];

  return {
    salesSummary: { today: salesToday, week: salesWeek, month: salesMonth },
    orderStatus: orderStatusCounts,
    wallet: { balance: walletBalance, recentPayouts },
    recentOrders,
    topProducts,
    notifications,
    reviews,
  };
}

module.exports = { getDashboardSummary }; 