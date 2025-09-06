require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function syncDeliverymanVehicleTables() {
  try {
    const sequelize = await initializeDatabase();

    // Import only new deliverymanVehicle models
    const DeliverymanVehicle = require('../deliverymanVehicle')(sequelize);


    const models = { DeliverymanVehicle };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter: true }); // NEVER use force here

    console.log('✅ DeliverymanVehicle tables synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing DeliverymanVehicle tables:', error);
    process.exit(1);
  }
};
