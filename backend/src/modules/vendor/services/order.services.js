const { Order, OrderItem, Product, User } = require('../../../app/models');

// Get all orders that include products belonging to this vendor
const getVendorOrders = async (vendorId) => {
  // Find all order items for this vendor's products
  const items = await OrderItem.findAll({
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }, {
      model: Order,
      as: 'order',
    }],
  });

  // Group items by order
  const ordersMap = {};
  items.forEach(item => {
    const orderId = item.order_id;
    if (!ordersMap[orderId]) {
      ordersMap[orderId] = {
        ...item.order.dataValues,
        items: [],
      };
    }
    ordersMap[orderId].items.push(item);
  });
  return Object.values(ordersMap);
};

// Get order details for this vendor (only their products/items)
const getVendorOrderDetails = async (orderId, vendorId) => {
  // Find order with customer info
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] }]
  });
  if (!order) return null;
  // Find items for this vendor
  const items = await OrderItem.findAll({
    where: { order_id: orderId },
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }],
  });
  return {
    ...order.dataValues,
    items,
    customer: order.customer,
    address: order.address,
  };
};

// Update order status (for now, update the whole order)
const updateOrderStatus = async (orderId, vendorId, status) => {
  // TODO: In future, support per-vendor status
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');
  order.status = status;
  await order.save();
  return order;
};

module.exports = {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus,
}; 