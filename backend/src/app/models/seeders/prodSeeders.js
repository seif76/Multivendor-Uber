require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function productionSeeders() {
  try {
    const sequelize = await initializeDatabase();

    // Import only new multivendor models
    const User = require('../user')(sequelize);
    const Admin = require('../admin')(sequelize);
    const CaptainVehicle = require('../captainVehicle')(sequelize);
    const Ride = require('../ride')(sequelize);
    const RideOffer = require('../rideOffer')(sequelize);
    const RidePayment = require('../ridePayment')(sequelize);
    const Wallet = require('../wallet')(sequelize);
    const Rating = require('../rating')(sequelize);
    const VendorInfo = require('../vendorInfo')(sequelize);
    const Product = require('../product')(sequelize);
    const Order = require('../order')(sequelize);
    const OrderItem = require('../orderItem')(sequelize);
    const VendorCategory = require('../vendorCategory')(sequelize);


    const models = { User, Admin, CaptainVehicle, Ride, RideOffer, RidePayment, Wallet, Rating, VendorInfo, Product, Order, OrderItem, VendorCategory };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter: true }); // NEVER use force here

    console.log('✅ Production tables synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing production tables:', error);
    process.exit(1);
  }
};
