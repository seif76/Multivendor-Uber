const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('RidePayment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ride_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passenger_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'wallet'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('successful', 'failed'),
      allowNull: false,
    },
  });

  return Payment;
};
