const {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus,
} = require('../services/order.services');

// Get all orders for the authenticated vendor
const getVendorOrdersController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const orders = await getVendorOrders(vendorId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order details for the authenticated vendor
const getVendorOrderDetailsController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const orderId = req.params.orderId;
    const order = await getVendorOrderDetails(orderId, vendorId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status (confirmed, shipped, delivered, etc.)
const updateOrderStatusController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const orderId = req.params.orderId;
    const { status } = req.body;
    const updated = await updateOrderStatus(orderId, vendorId, status);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getVendorOrdersController,
  getVendorOrderDetailsController,
  updateOrderStatusController,
}; 