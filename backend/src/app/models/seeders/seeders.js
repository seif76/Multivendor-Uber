require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file
const models = {}; // object to hold all models
module.exports = async function syncDatabase(){
  try {
    const sequelize = await initializeDatabase();

    // Import your models and initialize them with sequelize
    models.User = require('../user')(sequelize);
    models.Vehicle = require('../captainVehicle')(sequelize);
    models.Ride = require('../ride')(sequelize);
    models.RideOffer = require('../ride_offer')(sequelize);
    models.RidePayment = require('../ridesPayment')(sequelize);
    models.Wallet = require('../wallet')(sequelize);
    models.Rating = require('../rating')(sequelize);

    // Call associate methods if they exist (to setup relations)
    Object.values(models).forEach((model) => {
      if (model.associate) {
        model.associate(models);
      }
    });

    // Sync all models with the database (create tables)
    await sequelize.sync({ force: true }); // force:true drops tables if exist

    console.log('All tables created successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};
