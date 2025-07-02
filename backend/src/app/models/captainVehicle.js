const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('CaptainVehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    captain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    license_plate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.ENUM('sedan', 'suv', 'truck'),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_license_photo: {
      type: DataTypes.STRING, // URL to the photo
      allowNull: false,
    },
    national_id_photo: {
      type: DataTypes.STRING, // URL to the photo
      allowNull: false,
    },
  });

  return Vehicle;
};
