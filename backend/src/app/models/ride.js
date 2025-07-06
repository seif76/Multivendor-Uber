const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ride = sequelize.define('Ride', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    captain_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Pickup
    pickup_coordinates: {
      type: DataTypes.JSON, // { lat: xx, lng: yy }
      allowNull: false,
    },
    pickup_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pickup_place_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Drop-off
    dropoff_coordinates: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    dropoff_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dropoff_place_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Fare
    requested_fare: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    accepted_fare: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    // Status
    status: {
      type: DataTypes.ENUM('pending', 'negotiating', 'accepted', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
  });

  return Ride;
};
