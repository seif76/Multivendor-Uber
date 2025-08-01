const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
  
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    }, {
      indexes: [
        { name: 'idx_order_item_order_id', fields: ['order_id'] },
        { name: 'idx_order_item_product_id', fields: ['product_id'] }
      ]
    });
  
    return OrderItem;
  };
  