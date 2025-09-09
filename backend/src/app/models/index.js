const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

//shared
const User = require('./user')(sequelize, DataTypes);

// admin
const Admin = require('./admin')(sequelize, DataTypes);

// uber
const CaptainVehicle = require('./captainVehicle')(sequelize, DataTypes);
const Ride = require('./ride')(sequelize,DataTypes);

// multivendor
const VendorInfo = require('./vendorInfo')(sequelize, DataTypes);
const Product = require('./product')(sequelize,DataTypes);
const Order = require('./order')(sequelize,DataTypes);
const OrderItem = require('./orderItem')(sequelize,DataTypes);
const VendorCategory = require('./vendorCategory')(sequelize, DataTypes);
const VendorWorkingHour = require('./vendorWorkingHour')(sequelize, DataTypes);

// delivery system
const DeliverymanVehicle = require('./deliverymanVehicle')(sequelize, DataTypes);

// chat system
const Chat = require('./chat')(sequelize, DataTypes);
const ChatMessage = require('./chatMessage')(sequelize, DataTypes);

// settings system
const DeliveryZone = require('./deliveryZone')(sequelize, DataTypes);

// wallet system
const Wallet = require('./wallet')(sequelize, DataTypes);
const WalletTransaction = require('./walletTransaction')(sequelize, DataTypes);
const WithdrawalRequest = require('./withdrawalRequest')(sequelize, DataTypes);

// Associations
User.hasOne(CaptainVehicle, { foreignKey: 'captain_id', as: 'vehicle' });
CaptainVehicle.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

// deliveryman relations
User.hasOne(DeliverymanVehicle, { foreignKey: 'deliveryman_id', as: 'delivery_vehicle' });
DeliverymanVehicle.belongsTo(User, { foreignKey: 'deliveryman_id', as: 'deliveryman' });

// multivendor 
User.hasOne(VendorInfo, { foreignKey: 'vendor_id', as: 'vendor_info' });
VendorInfo.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

User.hasMany(Product, { foreignKey: 'vendor_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

// Product to VendorInfo association
Product.belongsTo(VendorInfo, { foreignKey: 'vendor_id', as: 'vendor_info' });
VendorInfo.hasMany(Product, { foreignKey: 'vendor_id', as: 'products' });

User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// deliveryman order relations
User.hasMany(Order, { foreignKey: 'deliveryman_id', as: 'delivery_orders' });
Order.belongsTo(User, { foreignKey: 'deliveryman_id', as: 'deliveryman' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

//ride relations
User.hasMany(Ride, { foreignKey: 'customer_id', as: 'customer_rides' });
User.hasMany(Ride, { foreignKey: 'captain_id', as: 'captain_rides' });
Ride.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Ride.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

VendorInfo.hasMany(VendorCategory, { foreignKey: 'vendor_id', as: 'categories' });
VendorCategory.belongsTo(VendorInfo, { foreignKey: 'vendor_id', as: 'vendor' });

Product.belongsTo(VendorCategory, { foreignKey: 'vendor_category_id', as: 'vendorCategory' });
VendorCategory.hasMany(Product, { foreignKey: 'vendor_category_id', as: 'products' });

VendorInfo.hasMany(VendorWorkingHour, { foreignKey: 'vendor_id', as: 'working_hours' });
VendorWorkingHour.belongsTo(VendorInfo, { foreignKey: 'vendor_id', as: 'vendor' });

// chat relations
User.hasMany(Chat, { foreignKey: 'participant1_id', as: 'chats_as_participant1' });
User.hasMany(Chat, { foreignKey: 'participant2_id', as: 'chats_as_participant2' });
Chat.belongsTo(User, { foreignKey: 'participant1_id', as: 'participant1' });
Chat.belongsTo(User, { foreignKey: 'participant2_id', as: 'participant2' });

Chat.hasMany(ChatMessage, { foreignKey: 'chat_id', as: 'messages' });
ChatMessage.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sent_messages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// wallet relations
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Wallet.hasMany(WalletTransaction, { foreignKey: 'wallet_id', as: 'transactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

Wallet.hasMany(WithdrawalRequest, { foreignKey: 'wallet_id', as: 'withdrawal_requests' });
WithdrawalRequest.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

User.hasMany(WalletTransaction, { foreignKey: 'created_by', as: 'created_transactions' });
WalletTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(WithdrawalRequest, { foreignKey: 'processed_by', as: 'processed_withdrawals' });
WithdrawalRequest.belongsTo(User, { foreignKey: 'processed_by', as: 'processor' });

module.exports = {
  sequelize,
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
  WithdrawalRequest,
};
