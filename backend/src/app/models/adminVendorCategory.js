const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminVendorCategory = sequelize.define('AdminVendorCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true    
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  }, {
 
    indexes: [ 
        {name: 'idx_vendor_category_name', fields: ['name']},
        {name: 'idx_vendor_category_is_active', fields: ['is_active']}
    ]
  });

  return AdminVendorCategory;
};