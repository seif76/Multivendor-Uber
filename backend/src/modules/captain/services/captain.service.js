//const { User, CaptainVehicle } = require('../../../app/models');
//const User = require('../../../app/models/user')
// const CaptainVehicle = require('../../../app/models/captainVehicle')
// const sequelize = require('../../../app/models/index')
const { sequelize, User, CaptainVehicle } = require('../../../app/models');


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

module.exports = {
  registerCaptain,
};
