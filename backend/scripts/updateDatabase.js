require('dotenv').config();
const { sequelize } = require('../src/app/models');

async function updateDatabase() {
  try {
    console.log('🔄 Starting database update...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Import all models
    const {
      User,
      Admin,
      CaptainVehicle,
      Ride,
      VendorInfo,
      Product,
      Order,
      OrderItem,
      VendorCategory,
      VendorWorkingHour,
      DeliverymanVehicle,
      Chat,
      ChatMessage,
      DeliveryZone,
      Wallet,
      WalletTransaction,
      WithdrawalRequest
    } = require('../src/app/models');
    
    console.log('📋 Models loaded successfully');
    
    // Sync all models with alter: true to update existing tables
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ All tables updated successfully!');
    
    // Display Order table structure
    console.log('\n📊 Order table structure:');
    const orderAttributes = Order.rawAttributes;
    Object.keys(orderAttributes).forEach(attr => {
      const field = orderAttributes[attr];
      console.log(`  - ${attr}: ${field.type.constructor.name}${field.allowNull ? ' (nullable)' : ' (required)'}`);
    });
    
    // Check if Order table exists and show its structure
    const [results] = await sequelize.query("DESCRIBE Orders");
    console.log('\n🗃️ Current Order table columns in database:');
    results.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the update
updateDatabase()
  .then(() => {
    console.log('🎉 Database update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database update failed:', error);
    process.exit(1);
  });
