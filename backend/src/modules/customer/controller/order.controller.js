const {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
} = require('../services/order.services');

// Create a new order (checkout)
const createOrderController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const order = await createOrder(customerId, req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders for the logged-in customer
const getMyOrdersController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await getMyOrders(customerId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order details for the logged-in customer
const getOrderDetailsController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orderId = req.params.orderId;
    const order = await getOrderDetails(orderId, customerId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelOrderController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orderId = req.params.orderId;
    const result = await cancelOrder(orderId, customerId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createOrderController,
  getMyOrdersController,
  getOrderDetailsController,
  cancelOrderController,
}; 