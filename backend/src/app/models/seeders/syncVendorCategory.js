require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function syncVendorCategory() {
  try {
    const sequelize = await initializeDatabase();

    // Import only new multivendor models
    
    const VendorCategory = require('../vendorCategory')(sequelize);
    const VendorWorkingHour = require('../vendorWorkingHour')(sequelize);


    const models = {  VendorCategory, VendorWorkingHour };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter: true }); // NEVER use force here

    console.log('✅ VendorCategory table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing VendorCategory table:', error);
    process.exit(1);
  }
};
