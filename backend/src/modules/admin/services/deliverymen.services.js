const { User, DeliverymanVehicle, Order } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllDeliverymen = async (page = 1, limit = 10, status = null,phone=null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.deliveryman_status = status;
    }
    if (phone) {
    whereClause.phone_number = { [Op.like]: `%${phone}%` };
  }
    const { count, rows } = await User.findAndCountAll({
      where: { 
        deliveryman_status: { [Op.ne]: 'none' },
        ...whereClause 
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      deliverymen: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalDeliverymen: count
    };
  } catch (error) {
    console.error('Error in getAllDeliverymen:', error);
    return {
      deliverymen: [],
      totalPages: 0,
      currentPage: page,
      totalDeliverymen: 0
    };
  }
};

const getDeliverymanById = async (id) => {
  try {
    const deliveryman = await User.findOne({ 
      where: { id },
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'deliveryman_status', 'profile_photo', 'rating', 'createdAt', 'updatedAt'
      ]
    });
    
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }

    // Get vehicle information
    const vehicle = await DeliverymanVehicle.findOne({
      where: { deliveryman_id: id }
    });

    // Get order statistics
    const totalOrders = await Order.count({ where: { deliveryman_id: id } });
    const completedOrders = await Order.count({ 
      where: { 
        deliveryman_id: id,
        status: 'delivered'
      } 
    });
    const activeOrders = await Order.count({ 
      where: { 
        deliveryman_id: id,
        status: { [Op.notIn]: ['delivered', 'cancelled'] } // Adjust based on your order statuses
      } 
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
      where: { deliveryman_id: id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'status', 'total_price', 'createdAt'] // Adjust based on your order fields
    });

    return {
      ...deliveryman.toJSON(),
      vehicle: vehicle ? vehicle.toJSON() : null,
      orderStats: {
        total: totalOrders,
        completed: completedOrders,
        active: activeOrders
      },
      recentOrders
    };
  } catch (error) {
    console.error('Error in getDeliverymanById:', error);
    throw error;
  }
};

const getDeliverymanVehicle = async (deliverymanId) => {
  try {
    const vehicle = await DeliverymanVehicle.findOne({
      where: { deliveryman_id: deliverymanId }
    });
    
    if (!vehicle) {
      throw new Error('Vehicle not found for this deliveryman');
    }

    return vehicle;
  } catch (error) {
    console.error('Error in getDeliverymanVehicle:', error);
    throw error;
  }
};

const getDeliverymanOrders = async (deliverymanId) => {
  try {
    const orders = await Order.findAll({
      where: { deliveryman_id: deliverymanId },
      order: [['createdAt', 'DESC']]
    });

    return orders;
  } catch (error) {
    console.error('Error in getDeliverymanOrders:', error);
    return [];
  }
};

const updateDeliverymanStatus = async (deliverymanId, status) => {
  try {
    const deliveryman = await User.findByPk(deliverymanId);
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }
    
    await deliveryman.update({ deliveryman_status: status });
    return deliveryman;
  } catch (error) {
    console.error('Error in updateDeliverymanStatus:', error);
    throw error;
  }
};

const deleteDeliveryman = async (deliverymanId) => {
  try {
    const deliveryman = await User.findByPk(deliverymanId);
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }
    
    // Delete associated vehicle
    await DeliverymanVehicle.destroy({ where: { deliveryman_id: deliverymanId } });
    
    // Delete deliveryman
    await deliveryman.destroy();
    return { message: 'Deliveryman deleted successfully' };
  } catch (error) {
    console.error('Error in deleteDeliveryman:', error);
    throw error;
  }
};

const getDeliverymanStats = async () => {
  try {
    const totalDeliverymen = await User.count({ where: { deliveryman_status: { [Op.ne]: 'none' } } });
    const activeDeliverymen = await User.count({ where: { deliveryman_status: 'Active' } });
    const pendingDeliverymen = await User.count({ where: { deliveryman_status: 'pending' } });
    const deactivatedDeliverymen = await User.count({ where: { deliveryman_status: 'Deactivated' } });

    return {
      total: totalDeliverymen,
      active: activeDeliverymen,
      pending: pendingDeliverymen,
      deactivated: deactivatedDeliverymen
    };
  } catch (error) {
    console.error('Error in getDeliverymanStats:', error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      deactivated: 0
    };
  }
};

module.exports = {
  getAllDeliverymen,
  getDeliverymanById,
  getDeliverymanVehicle,
  getDeliverymanOrders,
  updateDeliverymanStatus,
  deleteDeliveryman,
  getDeliverymanStats
};