const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vendor = sequelize.define('VendorInfo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shop_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    passport_photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    license_photo: {
      type: DataTypes.STRING,
      allowNull: true, // Optional
    },

    shop_front_photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Vendor;
};
