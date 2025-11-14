require('dotenv').config();
const initializeDatabase = require('../../../config/mysql/dbconnection'); // your DB connection file

module.exports = async function productionSeeders() {
  try {
    
    const sequelize = await initializeDatabase();
    

    // Import only new multivendor models
    const User = require('../user')(sequelize);
    const Admin = require('../admin')(sequelize);
    const CaptainVehicle = require('../captainVehicle')(sequelize);
    const VendorWorkingHour = require('../vendorWorkingHour')(sequelize);
    const Chat = require('../chat')(sequelize);
    const ChatMessage = require('../chatMessage')(sequelize);
    const Ride = require('../ride')(sequelize);
    const RideOffer = require('../ride_offer')(sequelize);
    const RidePayment = require('../ridesPayment')(sequelize);
    const Wallet = require('../wallet')(sequelize);
    const DeliverymanVehicle = require('../deliverymanVehicle')(sequelize);
    const WalletTransaction = require('../walletTransaction')(sequelize);
    const WithdrawalRequest = require('../withdrawalRequest')(sequelize);

    const Rating = require('../rating')(sequelize);
    const VendorInfo = require('../vendorInfo')(sequelize);
    const Product = require('../product')(sequelize);
    const Order = require('../order')(sequelize);
    const OrderItem = require('../orderItem')(sequelize);
    const VendorCategory = require('../vendorCategory')(sequelize);

    const AdminVendorCategory = require('../adminVendorCategory')(sequelize);


    const models = { 
        User, 
        Admin, 
        CaptainVehicle, 
        VendorWorkingHour, 
        Chat, 
        ChatMessage, 
        Ride, 
        RideOffer, 
        RidePayment,
        Wallet, 
        Rating, 
        VendorInfo, 
        Product, 
        Order, 
        OrderItem, 
        VendorCategory, 
        DeliverymanVehicle, 
        WalletTransaction, 
        WithdrawalRequest,
        AdminVendorCategory
    };

    // Setup associations if needed
    Object.values(models).forEach((model) => {
      if (model.associate) model.associate(models);
    });

    // Sync only these new tables
    await sequelize.sync({ alter:true }); // NEVER use force here

    console.log('✅ Production tables synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing production tables:', error);
    process.exit(1);
  }
};



// Run automatically if executed directly
if (require.main === module) {
    (async () => {
      await module.exports();
    })();
  }