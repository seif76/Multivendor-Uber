//const { User, CaptainVehicle } = require('../../../app/models');
//const User = require('../../../app/models/user')
// const CaptainVehicle = require('../../../app/models/captainVehicle')
// const sequelize = require('../../../app/models/index')
const { sequelize, User, CaptainVehicle } = require('../../../app/models');
const { Op } = require('sequelize');

const registerCaptain = async (userData, vehicleData) => {
  try {
    // Start a transaction for atomicity
    const result = await User.sequelize.transaction(async (transaction) => {
      // Step 1: Create the user
      const newUser = await User.create(userData, { transaction });

      // Step 2: Create the vehicle with captain_id linked to newUser.id
      const newVehicle = await CaptainVehicle.create(
        { ...vehicleData, captain_id: newUser.id },
        { transaction }
      );

      return { user: newUser, vehicle: newVehicle };
    });

    return result;
  } catch (error) {
    throw new Error(`Error registering captain: ${error.message}`);
  }
};

const deleteCaptain = async (phone_number) => {
  try {
    const user = await User.findOne({ where: { phone_number } });
    if (!user || user.captain_status === 'none') throw new Error('Captain not found');

    await CaptainVehicle.destroy({ where: { captain_id: user.id } });
    await user.destroy();
    return { message: 'Captain deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting captain: ${error.message}`);
  }
};

const editCaptain = async (phone_number, userUpdates, vehicleUpdates) => {
  try {
    const user = await User.findOne({ where: { phone_number } });
    if (!user || user.captain_status === 'none') throw new Error('Captain not found');

    await user.update(userUpdates);
    const vehicle = await CaptainVehicle.findOne({ where: { captain_id: user.id } });
    if (!vehicle) throw new Error('Captain vehicle not found');

    await vehicle.update(vehicleUpdates);

    return { user, vehicle };
  } catch (error) {
    throw new Error(`Error updating captain: ${error.message}`);
  }
};

const getCaptainByPhone = async (phone_number) => {
  try {
    const normalizedPhone = phone_number.trim();  // <-- trim here

    console.log('Searching for user with phone:', JSON.stringify(normalizedPhone));

    const user = await User.findOne({
      where: {
        phone_number: normalizedPhone,
        captain_status: { [Op.in]: [ 'Active'] },
      },
    });

    console.log('User found:', user);

    if (!user) return { user: null };

    const vehicle = await CaptainVehicle.findOne({ where: { captain_id: user.id } });
    console.log('Vehicle found:', vehicle);

    return { user, vehicle };
  } catch (error) {
    throw new Error(`Error fetching captain data: ${error.message}`);
  }
};

const setCaptainStatus = async (phone_number, status) => {
  const allowedStatuses = ['pending', 'Active', 'Deactivated'];

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }

  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.captain_status === 'none') {
    throw new Error('Captain not found');
  }

  await user.update({ captain_status: status });

  return user;
};

const getCaptainsByStatus = async (status) => {
  const allowedStatuses = ['pending', 'Active', 'Deactivated'];

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }

  const captains = await User.findAll({
    where: { captain_status: status },
    include: [
      {
        model: CaptainVehicle,
        as: 'vehicle',
      },
    ],
  });

  return captains;
};




module.exports = {
  registerCaptain,
  editCaptain,
  deleteCaptain,
  getCaptainByPhone,
  setCaptainStatus,
  getCaptainsByStatus,
};
