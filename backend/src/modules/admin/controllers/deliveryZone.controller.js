const {
    getAllZonesService,
    getZoneByIdService,
    createZoneService,
    updateZoneService,
    toggleZoneStatusService,
    deleteZoneService
  } = require('../services/deliveryZones');
  
  const getAllZones = async (req, res) => {
    try {
      const zones = await getAllZonesService();
      res.status(200).json(zones);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      res.status(500).json({ error: 'Failed to fetch delivery zones' });
    }
  };
  
  const getZoneById = async (req, res) => {
    try {
      const zone = await getZoneByIdService(req.params.id);
      res.status(200).json(zone);
    } catch (error) {
      if (error.message === 'Delivery zone not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to fetch delivery zone' });
    }
  };
  
  const createZone = async (req, res) => {
    try {
      const { city_name, base_delivery_fee } = req.body;
      
      if (!city_name || base_delivery_fee === undefined) {
        return res.status(400).json({ error: 'city_name and base_delivery_fee are required' });
      }
  
      const newZone = await createZoneService(req.body);
      res.status(201).json({ message: 'Delivery zone created successfully', zone: newZone });
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'A zone with this name already exists in the system' });
      }
      res.status(500).json({ error: 'Failed to create delivery zone' });
    }
  };
  
  const updateZone = async (req, res) => {
    try {
      const updatedZone = await updateZoneService(req.params.id, req.body);
      res.status(200).json({ message: 'Delivery zone updated successfully', zone: updatedZone });
    } catch (error) {
      if (error.message === 'Delivery zone not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error updating delivery zone:', error);
      res.status(500).json({ error: 'Failed to update delivery zone' });
    }
  };
  
  const toggleZoneStatus = async (req, res) => {
    try {
      const { is_active } = req.body;
      if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active must be a boolean' });
      }
  
      const updatedZone = await toggleZoneStatusService(req.params.id, is_active);
      res.status(200).json({ message: 'Delivery zone status updated', zone: updatedZone });
    } catch (error) {
      if (error.message === 'Delivery zone not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update delivery zone status' });
    }
  };
  
  const deleteZone = async (req, res) => {
    try {
      const response = await deleteZoneService(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      if (error.message === 'Delivery zone not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete delivery zone' });
    }
  };
  
  module.exports = {
    getAllZones,
    getZoneById,
    createZone,
    updateZone,
    toggleZoneStatus,
    deleteZone
  };