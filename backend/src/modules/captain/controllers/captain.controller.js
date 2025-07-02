const bcrypt = require('bcrypt');
const { registerCaptain } = require('../services/captain.service');

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

module.exports = {
  registerCaptainController,
};
