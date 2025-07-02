const { User } = require('../../../app/models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const registerCustomer = async (userData) => {
  const { phone_number, email } = userData;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ phone_number }, { email }],
    },
  });
  if (existingUser) {
    throw new Error('User with this phone number or email already exists');
  }

  userData.password = await bcrypt.hash(userData.password, 10);

  userData.customer_status = 'Active';

  const newUser = await User.create(userData);
  return newUser;
};

const getCustomerByPhone = async (phone_number) => {
  const user = await User.findOne({
    where: {
      phone_number,
      customer_status: { [Op.in]: ['pending', 'Active', 'Deactivated'] },
    },
  });

  if (!user) return null;
  return user;
};

const editCustomer = async (phone_number, updates) => {
  const user = await User.findOne({
    where: { phone_number, customer_status: { [Op.ne]: 'none' } },
  });

  if (!user) throw new Error('Customer not found');

  await user.update(updates);
  return user;
};

const deleteCustomer = async (phone_number) => {
  const user = await User.findOne({
    where: { phone_number, customer_status: { [Op.ne]: 'none' } },
  });

  if (!user) throw new Error('Customer not found');

  await user.destroy();

  return { message: 'Customer deleted successfully' };
};

const setCustomerStatus = async (phone_number, status) => {
  const allowedStatuses = ['pending', 'Active', 'Deactivated'];

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }

  const user = await User.findOne({
    where: { phone_number, customer_status: { [Op.ne]: 'none' } },
  });

  if (!user) throw new Error('Customer not found');

  await user.update({ customer_status: status });
  return user;
};

module.exports = { 
  registerCustomer,
  getCustomerByPhone,
  editCustomer,
  deleteCustomer,
  setCustomerStatus, 
                  };
