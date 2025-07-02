const bcrypt = require('bcrypt');
const { registerCaptain,deleteCaptain, editCaptain, getCaptainByPhone,
       setCaptainStatus,getCaptainsByStatus    
      } = require('../services/captain.service');

const registerCaptainController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
      gender,
      profile_photo,
    } = req.body.user;

    const {
      make,
      model,
      year,
      license_plate,
      vehicle_type,
      color,
      driver_license_photo,
      national_id_photo,
    } = req.body.vehicle;

    // Validate input (optional but recommended)
    if (
      !name ||
      !email ||
      !password ||
      !phone_number ||
      !make ||
      !model ||
      !year ||
      !license_plate ||
      !vehicle_type ||
      !driver_license_photo ||
      !national_id_photo
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      profile_photo,
      captain_status: 'pending',
    };

    const vehicleData = {
      make,
      model,
      year,
      license_plate,
      vehicle_type,
      color,
      driver_license_photo,
      national_id_photo,
    };

    const result = await registerCaptain(userData, vehicleData);

    return res.status(201).json({
      message: 'Captain registered successfully',
      user: result.user,
      vehicle: result.vehicle,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Failed to register captain: ${error.message}` });
  }
};

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

module.exports = {
  registerCaptainController,
  deleteCaptainController,
  editCaptainController,
  getCaptainByPhoneController,
  setCaptainStatusController,
  getActiveCaptainsController,
  getPendingCaptainsController,
  getDeactivatedCaptainsController,
};
