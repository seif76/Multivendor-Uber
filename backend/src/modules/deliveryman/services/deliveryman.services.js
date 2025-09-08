const { User, DeliverymanVehicle, Order } = require('../../../app/models');
const { OrderSocket } = require('../../../config/socket');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');

// Register a new deliveryman
const registerDeliveryman = async (userData, vehicleData) => {
  return await User.sequelize.transaction(async (transaction) => {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    userData.deliveryman_status = 'pending'; // Set initial status

    // Create user with hashed password
    const newUser = await User.create(userData, { transaction });

    // Create deliveryman vehicle and associate it
    const vehicle = await DeliverymanVehicle.create(
      { ...vehicleData, deliveryman_id: newUser.id },
      { transaction }
    );

    return { user: newUser, vehicle };
  });
};

// Register existing customer as deliveryman
const registerCustomerAsDeliveryman = async (customer_id, vehicleData) => {
  return await User.sequelize.transaction(async (transaction) => {
    // Update user status to pending deliveryman
    const updatedUser = await User.update(
      { deliveryman_status: 'pending' }, 
      { where: { id: customer_id }, transaction }
    );

    // Create deliveryman vehicle and associate it
    const vehicle = await DeliverymanVehicle.create(
      { ...vehicleData, deliveryman_id: customer_id },
      { transaction }
    );

    return { user: updatedUser, vehicle };
  });
};

// Get deliveryman profile with vehicle
const getDeliverymanProfile = async (deliveryman_id) => {
  const user = await User.findByPk(deliveryman_id, {
    include: [{
      model: DeliverymanVehicle,
      as: 'delivery_vehicle'
    }]
  });

  if (!user || user.deliveryman_status === 'none') {
    throw new Error('Deliveryman not found');
  }

  return user;
};

// Update deliveryman profile
const updateDeliverymanProfile = async (deliveryman_id, updateData, imageFiles = {}) => {
  const user = await User.findByPk(deliveryman_id);
  if (!user || user.deliveryman_status === 'none') {
    throw new Error('Deliveryman not found');
  }

  const updateFields = {
    name: updateData.name,
    email: updateData.email,
    phone_number: updateData.phone_number,
    gender: updateData.gender,
  };

  // Only update profile photo if a new image is uploaded
  if (imageFiles.profile_photo && imageFiles.profile_photo.path) {
    try {
      const uploadResult = await uploadToCloudinary(imageFiles.profile_photo.path, 'deliveryman_profiles');
      updateFields.profile_photo = uploadResult.url;
    } catch (uploadError) {
      throw new Error('Failed to upload profile photo');
    }
  }

  await user.update(updateFields);
  return user;
};

// Update deliveryman vehicle
const updateDeliverymanVehicle = async (deliveryman_id, vehicleData, imageFiles = {}) => {
  const vehicle = await DeliverymanVehicle.findOne({
    where: { deliveryman_id }
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const updateFields = {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    license_plate: vehicleData.license_plate,
    vehicle_type: vehicleData.vehicle_type,
    color: vehicleData.color,
  };

  // Handle image uploads based on vehicle type
  if (imageFiles.driver_license_photo && imageFiles.driver_license_photo.path) {
    try {
      const uploadResult = await uploadToCloudinary(imageFiles.driver_license_photo.path, 'deliveryman_licenses');
      updateFields.driver_license_photo = uploadResult.url;
    } catch (uploadError) {
      throw new Error('Failed to upload driver license photo');
    }
  }

  if (imageFiles.national_id_photo && imageFiles.national_id_photo.path) {
    try {
      const uploadResult = await uploadToCloudinary(imageFiles.national_id_photo.path, 'deliveryman_ids');
      updateFields.national_id_photo = uploadResult.url;
    } catch (uploadError) {
      throw new Error('Failed to upload national ID photo');
    }
  }

  await vehicle.update(updateFields);
  return vehicle;
};

// Get all deliverymen by status
const getDeliverymenByStatus = async (status) => {
  return await User.findAll({
    where: {
      deliveryman_status: status
    },
    include: [{
      model: DeliverymanVehicle,
      as: 'delivery_vehicle'
    }]
  });
};

// Set deliveryman status (admin function)
const setDeliverymanStatus = async (deliveryman_id, status) => {
  const user = await User.findByPk(deliveryman_id);
  if (!user) {
    throw new Error('User not found');
  }

  await user.update({ deliveryman_status: status });
  return user;
};

// Get deliveryman status counts (admin function)
const getDeliverymanStatusCounts = async () => {
  const counts = await User.findAll({
    attributes: [
      'deliveryman_status',
      [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
    ],
    where: {
      deliveryman_status: { [Op.ne]: 'none' }
    },
    group: ['deliveryman_status']
  });

  return counts;
};

// Delete deliveryman
const deleteDeliveryman = async (deliveryman_id) => {
  return await User.sequelize.transaction(async (transaction) => {
    // Delete vehicle first
    await DeliverymanVehicle.destroy({
      where: { deliveryman_id },
      transaction
    });

    // Update user status to none
    await User.update(
      { deliveryman_status: 'none' },
      { where: { id: deliveryman_id }, transaction }
    );

    return { message: 'Deliveryman deleted successfully' };
  });
};

// Accept delivery order
const acceptDeliveryOrder = async (orderId, deliverymanId) => {
  try {
    // Find the order
    const order = await Order.findByPk(orderId, {
      include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }]
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status !== 'ready') {
      throw new Error('Order is not ready for delivery');
    }
    
    // Update order with deliveryman assignment and status
    order.deliveryman_id = deliverymanId;
    order.status = 'shipped'; // Order is now being delivered
    await order.save();
    
    console.log(`Order ${orderId} accepted by deliveryman ${deliverymanId}`);
    
    // Notify customer that order is being delivered
    if (order.customer) {
      OrderSocket.notifyOrderStatusChange(orderId, 'shipped', order.customer.id);
      console.log(`Customer ${order.customer.id} notified that order ${orderId} is being delivered`);
    }
    
    return {
      ...order.dataValues,
      customer: order.customer
    };
  } catch (error) {
    console.error('Error accepting delivery order:', error);
    throw error;
  }
};

module.exports = {
  registerDeliveryman,
  registerCustomerAsDeliveryman,
  getDeliverymanProfile,
  updateDeliverymanProfile,
  updateDeliverymanVehicle,
  getDeliverymenByStatus,
  setDeliverymanStatus,
  getDeliverymanStatusCounts,
  deleteDeliveryman,
  acceptDeliveryOrder,
};