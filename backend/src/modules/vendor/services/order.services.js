const { Order, OrderItem, Product, User } = require('../../../app/models');
const { OrderSocket } = require('../../../config/socket');

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
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  // Find order with customer info
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }]
  });
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor has products in this order
  const vendorItems = await OrderItem.findAll({
    where: { order_id: orderId },
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }],
  });

  if (vendorItems.length === 0) {
    throw new Error('No products found for this vendor in this order');
  }

  // Update order status
  const previousStatus = order.status;
  order.status = status;
  await order.save();
  
  console.log(`Order ${orderId} status updated from ${previousStatus} to ${status} by vendor ${vendorId}`);
  
  // Send socket notification to customer
  if (order.customer) {
    OrderSocket.notifyOrderStatusChange(orderId, status, order.customer.id);
    console.log(`Socket notification sent to customer ${order.customer.id} for order ${orderId}`);
  }

  // If order is ready, notify deliverymen
  if (status === 'ready' && order.customer) {
    const orderDetails = {
      id: order.id,
      total_price: order.total_price,
      address: order.address,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email
      }
    };
    OrderSocket.notifyDeliverymenNewOrder(orderId, order.customer.id, status, orderDetails);
    console.log(`Delivery order ${orderId} broadcasted to deliverymen`);
  }
  
  return {
    ...order.dataValues,
    previousStatus,
    vendorItems: vendorItems.length
  };
};

module.exports = {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus,
}; 