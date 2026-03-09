const {
    getAllDeliverymen,
    getDeliverymanById,
    getDeliverymanVehicle,
    getDeliverymanOrders,
    updateDeliverymanStatus,
    deleteDeliveryman,
    getDeliverymanStats
  } = require('../services/deliverymen.services');
  
  const getAllDeliverymenController = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const deliverymen = await getAllDeliverymen(page, limit, status);
      res.status(200).json(deliverymen);
    } catch (error) {
      console.error('Error in getAllDeliverymenController:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const getDeliverymanByIdController = async (req, res) => {
    try {
      const { id } = req.params;
      const deliveryman = await getDeliverymanById(id);
      res.status(200).json(deliveryman);
    } catch (error) {
      console.error('Error in getDeliverymanByIdController:', error);
      res.status(404).json({ error: error.message });
    }
  };
  
  const getDeliverymanVehicleController = async (req, res) => {
    try {
      const { deliverymanId } = req.params;
      const vehicle = await getDeliverymanVehicle(deliverymanId);
      res.status(200).json(vehicle);
    } catch (error) {
      console.error('Error in getDeliverymanVehicleController:', error);
      res.status(404).json({ error: error.message });
    }
  };
  
  const getDeliverymanOrdersController = async (req, res) => {
    try {
      const { deliverymanId } = req.params;
      const orders = await getDeliverymanOrders(deliverymanId);
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error in getDeliverymanOrdersController:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const updateDeliverymanStatusController = async (req, res) => {
    try {
      const { deliverymanId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const deliveryman = await updateDeliverymanStatus(deliverymanId, status);
      res.status(200).json({
        message: 'Deliveryman status updated successfully',
        deliveryman
      });
    } catch (error) {
      console.error('Error in updateDeliverymanStatusController:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteDeliverymanController = async (req, res) => {
    try {
      const { deliverymanId } = req.params;
      const result = await deleteDeliveryman(deliverymanId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteDeliverymanController:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const getDeliverymanStatsController = async (req, res) => {
    try {
      const stats = await getDeliverymanStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error in getDeliverymanStatsController:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    getAllDeliverymenController,
    getDeliverymanByIdController,
    getDeliverymanVehicleController,
    getDeliverymanOrdersController,
    updateDeliverymanStatusController,
    deleteDeliverymanController,
    getDeliverymanStatsController
  };