const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ride = sequelize.define('Ride', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    passenger_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.JSON, // Store as { latitude: xx, longitude: xx }
      allowNull: false,
    },
    dropoff_location: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    requested_fare: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
  });

  return Ride;
};
