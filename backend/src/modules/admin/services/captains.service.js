const { User, CaptainVehicle, Ride } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllCaptains = async (page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.captain_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: { captain_status: { [Op.ne]: 'none' } },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      captains: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCaptains: count
    };
  } catch (error) {
    console.error('Error in getAllCaptains:', error);
    return {
      captains: [],
      totalPages: 0,
      currentPage: page,
      totalCaptains: 0
    };
  }
};

const getCaptainById = async (id) => {
  try {
    const captain = await User.findOne({ 
      where: { id },
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'captain_status', 'profile_photo', 'rating', 'createdAt', 'updatedAt'
      ]
    });
    
    if (!captain) {
      throw new Error('Captain not found');
    }

    // Get vehicle information
    const vehicle = await CaptainVehicle.findOne({
      where: { captain_id: id }
    });

    // Get ride statistics
    const totalRides = await Ride.count({ where: { captain_id: id } });
    const completedRides = await Ride.count({ 
      where: { 
        captain_id: id,
        status: 'completed'
      } 
    });
    const activeRides = await Ride.count({ 
      where: { 
        captain_id: id,
        status: 'active'
      } 
    });

    // Get recent rides
    const recentRides = await Ride.findAll({
      where: { captain_id: id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'status', 'pickup_coordinates', 'dropoff_coordinates', 'requested_fare', 'createdAt']
    });

    return {
      ...captain.toJSON(),
      vehicle: vehicle ? vehicle.toJSON() : null,
      rideStats: {
        total: totalRides,
        completed: completedRides,
        active: activeRides
      },
      recentRides
    };
  } catch (error) {
    console.error('Error in getCaptainById:', error);
    throw error;
  }
};

const getCaptainVehicle = async (captainId) => {
  try {
    const vehicle = await CaptainVehicle.findOne({
      where: { captain_id: captainId }
    });
    
    if (!vehicle) {
      throw new Error('Vehicle not found for this captain');
    }

    return vehicle;
  } catch (error) {
    console.error('Error in getCaptainVehicle:', error);
    throw error;
  }
};

const getCaptainRides = async (captainId) => {
  try {
    const rides = await Ride.findAll({
      where: { captain_id: captainId },
      order: [['createdAt', 'DESC']]
    });

    return rides;
  } catch (error) {
    console.error('Error in getCaptainRides:', error);
    return [];
  }
};

const updateCaptainStatus = async (captainId, status) => {
  try {
    const captain = await User.findByPk(captainId);
    if (!captain) {
      throw new Error('Captain not found');
    }
    
    await captain.update({ captain_status: status });
    return captain;
  } catch (error) {
    console.error('Error in updateCaptainStatus:', error);
    throw error;
  }
};

const deleteCaptain = async (captainId) => {
  try {
    const captain = await User.findByPk(captainId);
    if (!captain) {
      throw new Error('Captain not found');
    }
    
    // Delete associated vehicle
    await CaptainVehicle.destroy({ where: { captain_id: captainId } });
    
    // Delete captain
    await captain.destroy();
    return { message: 'Captain deleted successfully' };
  } catch (error) {
    console.error('Error in deleteCaptain:', error);
    throw error;
  }
};

const getCaptainStats = async () => {
  try {
    const totalCaptains = await User.count();
    const activeCaptains = await User.count({ where: { captain_status: 'Active' } });
    const pendingCaptains = await User.count({ where: { captain_status: 'pending' } });
    const deactivatedCaptains = await User.count({ where: { captain_status: 'Deactivated' } });

    return {
      total: totalCaptains,
      active: activeCaptains,
      pending: pendingCaptains,
      deactivated: deactivatedCaptains
    };
  } catch (error) {
    console.error('Error in getCaptainStats:', error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      deactivated: 0
    };
  }
};

module.exports = {
  getAllCaptains,
  getCaptainById,
  getCaptainVehicle,
  getCaptainRides,
  updateCaptainStatus,
  deleteCaptain,
  getCaptainStats
}; 