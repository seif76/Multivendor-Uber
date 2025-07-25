const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorWorkingHour = sequelize.define('VendorWorkingHour', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false, // 0=Sunday, 1=Monday, ...
    },
    open_time: {
      type: DataTypes.STRING,
      allowNull: false, // '08:00'
    },
    close_time: {
      type: DataTypes.STRING,
      allowNull: false, // '17:00'
    },
  });
  return VendorWorkingHour;
}; 