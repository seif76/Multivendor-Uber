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
      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      deliveryman_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
  
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
  
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'ready', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },

      delivery_status: {
        type: DataTypes.ENUM('none', 'deliveryman_arrived', 'order_handed_over', 'order_received', 'payment_made', 'payment_confirmed'),
        defaultValue: 'none',
      },
  
      payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'wallet'),
        defaultValue: 'cash',
        allowNull: true,
      },
  
      address: {
        type: DataTypes.STRING,
      },
    }, {
      indexes: [
        { name: 'idx_order_customer_id', fields: ['customer_id'] },
        { name: 'idx_order_deliveryman_id', fields: ['deliveryman_id'] },
        { name: 'idx_order_status', fields: ['status'] }
      ]
    });
  
    return Order;
  };
  