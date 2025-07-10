const { User } = require('../../../app/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const {registerCaptain} = require('../services/captain.service');

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
    console.log(JSON.stringify(error))
    return res
      .status(500)
      .json({ error: `Failed to register captain: ${error.message}` });
  }
};



const loginCaptainController = async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ error: 'Phone number and password are required' });
  }

  try {
    const user = await User.findOne({
      where: {
        phone_number,
        captain_status: { [Op.ne]: 'none' }, // must be a captain
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Captain not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, role: 'captain' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: `Login failed: ${error.message}` });
  }
};

module.exports = {
  loginCaptainController,
  registerCaptainController,
};
