const bcrypt = require('bcrypt');
const { deleteCaptain, editCaptain, getCaptainByPhone,
       setCaptainStatus,getCaptainsByStatus,getCaptainProfile    
      } = require('../services/captain.service');

const { Op } = require('sequelize');
const { User } = require('../../../app/models');


const editCaptainController = async (req, res) => {
  try {
    const { phone_number, user, vehicle } = req.body;
    const result = await editCaptain(phone_number, user, vehicle);
    res.status(200).json({ message: 'Captain updated successfully', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCaptainByPhoneController = async (req, res) => {
  try {
    let phone_number = req.query.phone_number;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    phone_number = phone_number.trim(); // trim here

    const result = await getCaptainByPhone(phone_number);

    if (!result.user) {
      return res.status(404).json({ error: 'Captain not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: `Failed to get captain: ${error.message}` });
  }
};

const setCaptainStatusController = async (req, res) => {
  try {
    let { phone_number, status } = req.body;

    if (!phone_number || !status) {
      return res.status(400).json({ error: 'Phone number and status are required' });
    }

    phone_number = phone_number.trim();
    status = status.trim();

    const updatedCaptain = await setCaptainStatus(phone_number, status);

    return res.status(200).json({ message: 'Captain status updated', user: updatedCaptain });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getActiveCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('Active');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendingCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('pending');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDeactivatedCaptainsController = async (req, res) => {
  try {
    const captains = await getCaptainsByStatus('Deactivated');
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCaptainProfileController = async (req, res) => {
  try {
    const captainId = req.user.id; // from JWT middleware
    const captain = await getCaptainProfile(captainId);
    return res.status(200).json(captain);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: `Failed to fetch captain: ${error.message}` });
  }
};

// For Admins dashboard

const getAllCaptainsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = {
      captain_status: { [Op.ne]: 'none' }, // only users who are captains
    };

    if (status) {
      where.captain_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      //status,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      captains: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCaptains: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



const getAllCaptainStatusCountsController = async (req, res) => {
  try {
    const [active, pending, deactivated, total] = await Promise.all([
      User.count({ where: { captain_status: 'Active' } }),
      User.count({ where: { captain_status: 'pending' } }),
      User.count({ where: { captain_status: 'Deactivated' } }),
      User.count({ where: { captain_status: { [Op.ne]: 'none' } } }),
    ]);

    return res.status(200).json({
      total,
      active,
      pending,
      deactivated,
    });
  } catch (error) {
    console.error('Error counting captains:', error.message);
    return res.status(500).json({ error: 'Failed to count captains' });
  }
};



const deleteCaptainController = async (req, res) => {
  try {
    const { phone_number } = req.query; // use query, not body

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const deleted = await deleteCaptain(phone_number);
    res.status(200).json({ message: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// get captain details for pending request 


// const getCaptainByPhoneController = async (req, res) => {
//   try {
//     const { phone_number } = req.query;

//     if (!phone_number) {
//       return res.status(400).json({ error: 'Phone number is required' });
//     }

//     // Find user by phone and ensure it's a captain
//     const user = await User.findOne({ where: { phone_number } });

//     if (!user) {
//       return res.status(404).json({ error: 'Captain not found' });
//     }

//     if (user.captain_status === 'none') {
//       return res.status(400).json({ error: 'This user is not a captain' });
//     }

//     // Get the vehicle info linked to this captain
//     const vehicle = await CaptainVehicle.findOne({ where: { captain_id: user.id } });

//     return res.status(200).json({ user, vehicle });
//   } catch (error) {
//     console.error('Error fetching captain details:', error.message);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };




module.exports = {
  deleteCaptainController,
  editCaptainController,
  getCaptainByPhoneController,
  setCaptainStatusController,
  getActiveCaptainsController,
  getPendingCaptainsController,
  getDeactivatedCaptainsController,
  getCaptainProfileController,
  getAllCaptainsController,
  getAllCaptainStatusCountsController,
};
