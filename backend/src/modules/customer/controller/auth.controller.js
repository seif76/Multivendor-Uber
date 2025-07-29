const { User } = require('../../../app/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');

const loginCustomerController = async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ error: 'Phone number and password are required' });
  }

  try {
    const user = await User.findOne({
      where: {
        phone_number,
        customer_status: { [Op.ne]: 'none' },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'customer not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phone_number: user.phone_number,
        gender: user.gender,
        captain_status: user.captain_status,
        customer_status: user.customer_status,
        deliveryman_status: user.deliveryman_status,
        vendor_status: user.vendor_status,
        user_type: 'customer'
      },
      process.env.JWT_SECRET
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

const getCustomerProfileController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.customer_status === 'none') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      customer_status: user.customer_status,
      profile_photo: user.profile_photo,
      gender: user.gender,
      
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerCustomerController = async (req, res) => {
  try {
    const { name, email, password, phone_number, gender } = req.body;
    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Check if user exists
    const existing = await User.findOne({ where: { phone_number } });
    if (existing) {
      return res.status(409).json({ error: 'Customer with this phone number already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Upload profile photo if present
    let profilePhotoUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path, 'customer_profiles');
        profilePhotoUrl = result.url;
      } catch (err) {
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary: ' + err.message });
      }
    }
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      customer_status: 'Active',
      profile_photo: profilePhotoUrl,
    });
    return res.status(201).json({
      message: 'Customer registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        gender: user.gender,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
};

module.exports = {
  loginCustomerController,
  getCustomerProfileController,
  registerCustomerController,
}; 