const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorCategory = sequelize.define('VendorCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return VendorCategory;
}; 