const { User, Order, OrderItem, Product } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllCustomers = async (page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.customer_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: { customer_status: { [require('sequelize').Op.ne]: 'none' } },
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'customer_status', 'profile_photo', 'rating', 'createdAt'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      customers: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCustomers: count
    };
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    return {
      customers: [],
      totalPages: 0,
      currentPage: page,
      totalCustomers: 0
    };
  }
};

const getCustomerById = async (customerId) => {
  try {
    const customer = await User.findByPk(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error;
  }
};

const getCustomerOrders = async (customerId) => {
  try {
    const orders = await Order.findAll({
      where: { customer_id: customerId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return orders;
  } catch (error) {
    console.error('Error in getCustomerOrders:', error);
    return [];
  }
};

const updateCustomerStatus = async (customerId, status) => {
  try {
    const customer = await User.findByPk(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    await customer.update({ customer_status: status });
    return customer;
  } catch (error) {
    console.error('Error in updateCustomerStatus:', error);
    throw error;
  }
};

const deleteCustomer = async (customerId) => {
  try {
    const customer = await User.findByPk(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    await customer.destroy();
    return { message: 'Customer deleted successfully' };
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
};

const getCustomerStats = async () => {
  try {
    const totalCustomers = await User.count();
    const activeCustomers = await User.count({ where: { customer_status: 'Active' } });
    const deactivatedCustomers = await User.count({ where: { customer_status: 'Deactivated' } });

    return {
      total: totalCustomers,
      active: activeCustomers,
      deactivated: deactivatedCustomers
    };
  } catch (error) {
    console.error('Error in getCustomerStats:', error);
    return {
      total: 0,
      active: 0,
      deactivated: 0
    };
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  updateCustomerStatus,
  deleteCustomer,
  getCustomerStats
}; 