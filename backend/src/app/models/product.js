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
  
      vendor_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
  
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    }, {
      indexes: [
        { name: 'idx_product_vendor_id', fields: ['vendor_id'] },
        { name: 'idx_product_vendor_category_id', fields: ['vendor_category_id'] },
        { name: 'idx_product_status', fields: ['status'] }
      ]
    });
  
    return Product;
  };
  