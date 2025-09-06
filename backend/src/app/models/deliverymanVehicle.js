
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliverymanVehicle = sequelize.define('DeliverymanVehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deliveryman_id: {
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
      allowNull: true, // Bicycles might not have a specific year
    },
    license_plate: {
      type: DataTypes.STRING,
      allowNull: true, // Bicycles don't have license plates
    },
    vehicle_type: {
      type: DataTypes.ENUM('motorcycle', 'bicycle', 'car', 'van'),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_license_photo: {
      type: DataTypes.STRING, // URL to the photo
      allowNull: true, // Not required for bicycles
    },
    national_id_photo: {
      type: DataTypes.STRING, // URL to the photo
      allowNull: false, // Always required for identity verification
    },
  }, {
    indexes: [
      { name: 'idx_deliveryman_vehicle_deliveryman_id', fields: ['deliveryman_id'] }
    ],
    validate: {
      // Custom validation to ensure required fields based on vehicle type
      validateVehicleTypeRequirements() {
        if (this.vehicle_type === 'bicycle') {
          // For bicycles, driver license is not required
          // License plate is not required
          // Year might not be applicable
        } else {
          // For motorized vehicles, these fields should be required
          if (!this.driver_license_photo) {
            throw new Error('Driver license photo is required for motorized vehicles');
          }
          if (!this.license_plate) {
            throw new Error('License plate is required for motorized vehicles');
          }
          if (!this.year) {
            throw new Error('Year is required for motorized vehicles');
          }
        }
      }
    }
  });

  return DeliverymanVehicle;
};
