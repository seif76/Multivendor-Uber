const bcrypt = require('bcrypt');
const { deleteCaptain, editCaptain, getCaptainByPhone,
       setCaptainStatus,getCaptainsByStatus,getCaptainProfile    
      } = require('../services/captain.service');

const deleteCaptainController = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const deleted = await deleteCaptain(phone_number);
    res.status(200).json({ message: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editCaptainController = async (req, res) => {
  try {
    const { phone_number, user, vehicle } = req.body;
    const result = await editCaptain(phone_number, user, vehicle);
    res.status(200).json({ message: 'Captain updated successfully', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCaptainByPhoneController = async (req, res) => {
  try {
    let phone_number = req.query.phone_number;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    phone_number = phone_number.trim(); // trim here

    const result = await getCaptainByPhone(phone_number);

    if (!result.user) {
      return res.status(404).json({ error: 'Captain not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: `Failed to get captain: ${error.message}` });
  }
};

const setCaptainStatusController = async (req, res) => {
  try {
    let { phone_number, status } = req.body;

    if (!phone_number || !status) {
      return res.status(400).json({ error: 'Phone number and status are required' });
    }

    phone_number = phone_number.trim();
    status = status.trim();

    const updatedCaptain = await setCaptainStatus(phone_number, status);

    return res.status(200).json({ message: 'Captain status updated', user: updatedCaptain });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getActiveCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('Active');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendingCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('pending');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDeactivatedCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('Deactivated');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCaptainProfileController = async (req, res) => {
  try {
    const captainId = req.user.id; // from JWT middleware
    const captain = await getCaptainProfile(captainId);
    return res.status(200).json(captain);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: `Failed to fetch captain: ${error.message}` });
  }
};

module.exports = {
  deleteCaptainController,
  editCaptainController,
  getCaptainByPhoneController,
  setCaptainStatusController,
  getActiveCaptainsController,
  getPendingCaptainsController,
  getDeactivatedCaptainsController,
  getCaptainProfileController,
};
