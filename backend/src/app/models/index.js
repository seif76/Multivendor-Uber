const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

//shared
const User = require('./user')(sequelize, DataTypes);

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


// Associations
User.hasOne(CaptainVehicle, { foreignKey: 'captain_id', as: 'vehicle' });
CaptainVehicle.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });


// multivendor 
User.hasOne(VendorInfo, { foreignKey: 'vendor_id', as: 'vendor_info' });
VendorInfo.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

User.hasMany(Product, { foreignKey: 'vendor_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

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

module.exports = {
  sequelize,
  User,
  CaptainVehicle,
  Ride,
  VendorInfo,
  Product,
  Order,
  OrderItem,
  VendorCategory,
  VendorWorkingHour,
};
