const {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus,
  updateDeliveryStatus,
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

    if (!status) {
      return res.status(400).json({ 
        error: 'Status is required',
        validStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled']
      });
    }

    const updated = await updateOrderStatus(orderId, vendorId, status);
    
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated,
      socketNotificationSent: !!updated.customer
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ 
      error: err.message,
      orderId: req.params.orderId,
      vendorId: req.user.id
    });
  }
};

// Update delivery status (vendor actions)
const updateDeliveryStatusController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await updateDeliveryStatus(orderId, vendorId, status);
    
    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      order: result,
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ 
      error: error.message,
      orderId: req.params.orderId,
      vendorId: req.user.id
    });
  }
};

module.exports = {
  getVendorOrdersController,
  getVendorOrderDetailsController,
  updateOrderStatusController,
  updateDeliveryStatusController,
}; 