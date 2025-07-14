const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
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
  
      description: {
        type: DataTypes.TEXT,
      },
  
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
  
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
  
      image: {
        type: DataTypes.STRING,
      },
  
      category: {
        type: DataTypes.STRING,
      },
  
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    });
  
    return Product;
  };
  