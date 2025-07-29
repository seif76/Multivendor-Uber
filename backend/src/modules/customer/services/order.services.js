const { Order, OrderItem, Product, User } = require('../../../app/models');
const { OrderSocket } = require('../../../config/socket');

// Create a new order (checkout)
const createOrder = async (customerId, { items, address }) => {
  // Calculate total price and validate single vendor
  let total = 0;
  const productMap = {};
  let vendorId = null;
  for (const item of items) {
    const product = await Product.findByPk(item.product_id);
    if (!product) throw new Error('Product not found');
    if (vendorId === null) vendorId = product.vendor_id;
    if (product.vendor_id !== vendorId) throw new Error('All items must be from the same vendor');
    productMap[item.product_id] = product;
    total += parseFloat(product.price) * item.quantity;
  }
  // Create order
  const order = await Order.create({
    customer_id: customerId,
    total_price: total,
    address,
    status: 'pending',
  });
  // Create order items
  const orderItems = await Promise.all(items.map(item =>
    OrderItem.create({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: productMap[item.product_id].price,
    })
  ));

  const orderWithItems = { ...order.dataValues, items: orderItems };

  // Use OrderSocket for new order notification
  OrderSocket.notifyNewOrder(order.id, customerId, 'pending');

  return orderWithItems;
};

// Get all orders for the logged-in customer
const getMyOrders = async (customerId) => {
  const orders = await Order.findAll({
    where: { customer_id: customerId },
    order: [['createdAt', 'DESC']],
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ 
        model: Product, 
        as: 'product',
        include: [{ model: User, as: 'vendor' }]
      }],
    }],
  });
  return orders;
};

// Get order details for the logged-in customer
const getOrderDetails = async (orderId, customerId) => {
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ 
        model: Product, 
        as: 'product',
        include: [{ model: User, as: 'vendor' }]
      }],
    }],
  });
  return order;
};

const cancelOrder = async (orderId, customerId) => {
  const order = await Order.findOne({ where: { id: orderId, customer_id: customerId } });
  if (!order) throw new Error('Order not found');
  if (order.status !== 'pending') throw new Error('Only pending orders can be cancelled');
  await OrderItem.destroy({ where: { order_id: orderId } });
  await order.destroy();
  return { message: 'Order cancelled successfully' };
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  }; 