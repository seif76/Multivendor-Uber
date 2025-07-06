const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const User = require('./user')(sequelize, DataTypes);
const CaptainVehicle = require('./captainVehicle')(sequelize, DataTypes);
const Ride = require('./ride')(sequelize,DataTypes);

// Associations
User.hasOne(CaptainVehicle, { foreignKey: 'captain_id', as: 'vehicle' });
CaptainVehicle.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

//ride relations
User.hasMany(Ride, { foreignKey: 'customer_id', as: 'customer_rides' });
User.hasMany(Ride, { foreignKey: 'captain_id', as: 'captain_rides' });
Ride.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Ride.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

module.exports = {
  sequelize,
  User,
  CaptainVehicle,
  Ride,
};
