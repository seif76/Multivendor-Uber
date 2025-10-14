const { 
    registerCustomer,
    getCustomerByPhone,
    editCustomer,
    deleteCustomer,
    setCustomerStatus,
     } = require('../services/customer.service');
const { Op } = require('sequelize');
const { User } = require('../../../app/models');


const registerCustomerController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
      gender,
      profile_photo,
    } = req.body;

    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newUser = await registerCustomer({
      name,
      email,
      password,
      phone_number,
      gender,
      profile_photo,
    });

    res.status(201).json({ message: 'Customer registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCustomerByPhoneController = async (req, res) => {
  try {
    const { phone_number } = req.query;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const customer = await getCustomerByPhone(phone_number);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const editCustomerController = async (req, res) => {
//   try {
//     const { phone_number, updates } = req.body;

//     if (!phone_number || !updates) {
//       return res.status(400).json({ error: 'Phone number and updates are required' });
//     }

//     const updatedCustomer = await editCustomer(phone_number, updates);

//     res.status(200).json({ message: 'Customer updated', user: updatedCustomer });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
const editCustomerController = async (req, res) => {
  try {
    const { phone_number, updates } = req.body;

    if (!phone_number || !updates) {
      return res.status(400).json({ error: 'Phone number and updates are required' });
    }

    // You can also ensure photo updates are excluded
    delete updates.profile_photo;

    const updatedCustomer = await editCustomer(phone_number, updates);
    res.status(200).json({ message: 'Customer updated', user: updatedCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const setCustomerStatusController = async (req, res) => {
  try {
    const { phone_number, status } = req.body;

    if (!phone_number || !status) {
      return res.status(400).json({ error: 'Phone number and status are required' });
    }

    const updatedCustomer = await setCustomerStatus(phone_number, status);
    res.status(200).json({ message: 'Customer status updated', user: updatedCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// For Admins dashboard

const getAllCustomersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = {
      customer_status: { [Op.ne]: 'none' }, // only users who are customers
    };

    if (status) {
      where.customer_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      //status,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      customers: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalcustomers: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



const getAllCustomersStatusCountsController = async (req, res) => {
  try {
    const [active, deactivated, total] = await Promise.all([
      User.count({ where: { customer_status: 'Active' } }),
      User.count({ where: { customer_status: 'Deactivated' } }),
      User.count({ where: { customer_status: { [Op.ne]: 'none' } } }),
    ]);

    return res.status(200).json({
      total,
      active,
      deactivated,
    });
  } catch (error) {
    console.error('Error counting customers:', error.message);
    return res.status(500).json({ error: 'Failed to count customers' });
  }
};


const deleteCustomerController = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await deleteCustomer(phone_number);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};









module.exports = { 
    registerCustomerController ,
    getCustomerByPhoneController,
    editCustomerController,
    deleteCustomerController,
    setCustomerStatusController,
    getAllCustomersController,
    getAllCustomersStatusCountsController,
    
};
