const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const User = require('./user')(sequelize, DataTypes);
const CaptainVehicle = require('./captainVehicle')(sequelize, DataTypes);

// Associations
User.hasOne(CaptainVehicle, { foreignKey: 'captain_id', as: 'vehicle' });
CaptainVehicle.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

module.exports = {
  sequelize,
  User,
  CaptainVehicle,
};
