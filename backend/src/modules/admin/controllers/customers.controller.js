const {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  updateCustomerStatus,
  deleteCustomer,
  getCustomerStats
} = require('../services/customers.service');
const bcrypt = require('bcrypt');
const upload = require('../../../middlewares/uploadLocal');
const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');

const getAllCustomersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const customers = await getAllCustomers(page, limit, status);
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error in getAllCustomersController:', error);
    res.status(500).json({ error: error.message });
  }
};

const registerCustomerController = async (req, res) => {
  try {
    const { name, email, password, phone_number, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({ error: 'Name, email, password, and phone number are required' });
    }

    // Check if user already exists
    const { User } = require('../../../app/models');
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { phone_number }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email already exists' 
          : 'Phone number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile photo upload
    let profilePhotoUrl = null;
    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.path, 'customers');
        profilePhotoUrl = url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'Failed to upload profile photo' });
      }
    }

    // Create customer
    const customer = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender: gender || 'male',
      profile_photo: profilePhotoUrl,
      customer_status: 'Active',
      vendor_status: 'none',
      captain_status: 'none',
      deliveryman_status: 'none',
      rating: 0
    });

    // Remove password from response
    const customerResponse = customer.toJSON();
    delete customerResponse.password;

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: customerResponse
    });
  } catch (error) {
    console.error('Error in registerCustomerController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCustomerByIdController = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await getCustomerById(customerId);
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error in getCustomerByIdController:', error);
    res.status(404).json({ error: error.message });
  }
};

const getCustomerOrdersController = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await getCustomerOrders(customerId);
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error in getCustomerOrdersController:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateCustomerStatusController = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const customer = await updateCustomerStatus(customerId, status);
    res.status(200).json({
      message: 'Customer status updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error in updateCustomerStatusController:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCustomerController = async (req, res) => {
  try {
    const { customerId } = req.query;
    const result = await deleteCustomer(customerId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteCustomerController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCustomerStatsController = async (req, res) => {
  try {
    const stats = await getCustomerStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getCustomerStatsController:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCustomersController,
  registerCustomerController,
  getCustomerByIdController,
  getCustomerOrdersController,
  updateCustomerStatusController,
  deleteCustomerController,
  getCustomerStatsController
}; 