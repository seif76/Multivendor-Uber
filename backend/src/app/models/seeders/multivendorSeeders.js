require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function syncMultivendorTables() {
  try {
    const sequelize = await initializeDatabase();

    // Import only new multivendor models
    const VendorInfo = require('../VendorInfo')(sequelize);
    const Product = require('../product')(sequelize);
    const Order = require('../order')(sequelize);
    const OrderItem = require('../orderItem')(sequelize);

    const models = { VendorInfo, Product, Order, OrderItem };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter: true }); // NEVER use force here

    console.log('✅ Multivendor tables synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing multivendor tables:', error);
    process.exit(1);
  }
};
