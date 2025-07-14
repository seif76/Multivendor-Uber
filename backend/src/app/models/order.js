const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
  
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
  
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
  
      payment_method: {
        type: DataTypes.STRING,
      },
  
      address: {
        type: DataTypes.STRING,
      },
    });
  
    return Order;
  };
  