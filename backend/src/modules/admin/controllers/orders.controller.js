const { 
  getAllOrders, 
  getOrderStats, 
  updateOrderStatus, 
  getOrderById,
  deleteOrder
} = require('../services/orders.service');

const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const orders = await getAllOrders(page, limit, status);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderStatsController = async (req, res) => {
  try {
    const stats = await getOrderStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    const updatedOrder = await updateOrderStatus(orderId, status);
    res.status(200).json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await getOrderById(orderId);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    await deleteOrder(orderId);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOrdersController,
  getOrderStatsController,
  updateOrderStatusController,
  getOrderByIdController,
  deleteOrderController
}; 