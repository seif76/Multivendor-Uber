const {
  getAllCaptains,
  getCaptainById,
  getCaptainVehicle,
  getCaptainRides,
  updateCaptainStatus,
  deleteCaptain,
  getCaptainStats
} = require('../services/captains.service');

const getAllCaptainsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const captains = await getAllCaptains(page, limit, status);
    res.status(200).json(captains);
  } catch (error) {
    console.error('Error in getAllCaptainsController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCaptainByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const captain = await getCaptainById(id);
    res.status(200).json(captain);
  } catch (error) {
    console.error('Error in getCaptainByIdController:', error);
    res.status(404).json({ error: error.message });
  }
};

const getCaptainVehicleController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const vehicle = await getCaptainVehicle(captainId);
    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error in getCaptainVehicleController:', error);
    res.status(404).json({ error: error.message });
  }
};

const getCaptainRidesController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const rides = await getCaptainRides(captainId);
    res.status(200).json({ rides });
  } catch (error) {
    console.error('Error in getCaptainRidesController:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateCaptainStatusController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const captain = await updateCaptainStatus(captainId, status);
    res.status(200).json({
      message: 'Captain status updated successfully',
      captain
    });
  } catch (error) {
    console.error('Error in updateCaptainStatusController:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCaptainController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const result = await deleteCaptain(captainId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteCaptainController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCaptainStatsController = async (req, res) => {
  try {
    const stats = await getCaptainStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getCaptainStatsController:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCaptainsController,
  getCaptainByIdController,
  getCaptainVehicleController,
  getCaptainRidesController,
  updateCaptainStatusController,
  deleteCaptainController,
  getCaptainStatsController
}; 