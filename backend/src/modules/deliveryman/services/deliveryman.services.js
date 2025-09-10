const { User, DeliverymanVehicle, Order, VendorInfo } = require('../../../app/models');
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
    // Find the order with customer and vendor details
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] },
      ]
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status !== 'ready') {
      throw new Error('Order is not ready for delivery');
    }
    
    const vendor = await VendorInfo.findOne({ 
      where: { vendor_id: order.vendor_id },
      attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location']
    });
    
    // Get deliveryman details
    const deliveryman = await User.findByPk(deliverymanId, {
      attributes: ['id', 'name', 'phone_number'],
      include: [{
        model: DeliverymanVehicle,
        as: 'delivery_vehicle',
        attributes: ['make', 'model', 'license_plate', 'vehicle_type']
      }]
    });
    
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }
    
    // Update order with deliveryman assignment (keep status as 'ready' for delivery confirmation)
    order.deliveryman_id = deliverymanId;
    // Order status remains 'ready' until delivery confirmation is complete
    await order.save();
    
    console.log(`Order ${orderId} accepted by deliveryman ${deliverymanId}`);
    
    // Notify customer that deliveryman has been assigned
    if (order.customer) {
      OrderSocket.notifyOrderStatusChange(orderId, 'ready', order.customer.id);
      console.log(`Customer ${order.customer.id} notified that deliveryman has been assigned to order ${orderId}`);
    }
    
    // Notify vendor that order has been accepted with deliveryman details
    if (vendor) {
      OrderSocket.notifyVendorOrderAccepted(orderId, vendor.vendor_id, deliveryman);
      console.log(`Vendor ${vendor.vendor_id} notified that order ${orderId} has been accepted by deliveryman`);
    }
    
    return {
      ...order.dataValues,
      customer: order.customer,
      vendor: vendor,
      deliveryman: deliveryman
    };
  } catch (error) {
    console.error('Error accepting delivery order:', error);
    throw error;
  }
};

// Update delivery status
const updateDeliveryStatus = async (orderId, deliverymanId, newStatus) => {
  const { Order } = require('../../../app/models');
  
  const order = await Order.findByPk(orderId, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] },
      { model: User, as: 'deliveryman', attributes: ['id', 'name', 'phone_number'] }
    ]
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.deliveryman_id !== deliverymanId) {
    throw new Error('Unauthorized: This order is not assigned to you');
  }

  if (order.status !== 'ready') {
    throw new Error('Order must be in ready status to update delivery status');
  }

  // Validate status progression based on payment method
  const isCashPayment = order.payment_method === 'cash';
  const validStatuses = !isCashPayment 
    ? ['deliveryman_arrived', 'order_handed_over', 'order_received']
    : ['deliveryman_arrived', 'order_handed_over', 'order_received', 'payment_made', 'payment_confirmed'];
  
  const currentIndex = validStatuses.indexOf(order.delivery_status);
  const newIndex = validStatuses.indexOf(newStatus);

  if (newIndex <= currentIndex) {
    throw new Error('Invalid status progression');
  }

  // Additional validation for specific statuses
  if (newStatus === 'order_received' && order.delivery_status !== 'order_handed_over') {
    throw new Error('Order must be handed over by vendor before deliveryman can receive it');
  }

  if (newStatus === 'payment_made' && !isCashPayment) {
    throw new Error('Payment made status is only valid for cash payments');
  }

  if (newStatus === 'payment_confirmed' && !isCashPayment) {
    throw new Error('Payment confirmed status is only valid for cash payments');
  }

  // Update delivery status
  await order.update({ delivery_status: newStatus });

  // Mark order as shipped when delivery is complete
  if (newStatus === 'order_received' && !isCashPayment) {
    await order.update({ status: 'shipped' });
  }
  if (newStatus === 'payment_confirmed' && isCashPayment) {
    await order.update({ status: 'shipped' });
  }

  // Get vendor information for socket notification
  const {VendorInfo } = require('../../../app/models');
 
  
  const vendor = await VendorInfo.findOne({ where: { vendor_id: order.vendor_id }, attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location'] });

  // Notify via socket
  const socketManager = require('../../../config/socket/socketManager');
  const orderDetails = {
    id: order.id,
    total_price: order.total_price,
    address: order.address,
    payment_method: order.payment_method,
    status: order.status,
    delivery_status: order.delivery_status,
    customer: order.customer,
    vendor: vendor,
    deliveryman: order.deliveryman
  };
console.log('vendorrr ifffffffffffff    :'  + vendor);
  if (vendor) {
    socketManager.notifyDeliveryStatusUpdate(orderId, vendor.vendor_id, deliverymanId, newStatus, orderDetails);
  }

  return order;
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
  updateDeliveryStatus,
};