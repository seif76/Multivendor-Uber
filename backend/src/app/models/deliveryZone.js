module.exports = (sequelize, DataTypes) => {
  const DeliveryZone = sequelize.define('DeliveryZone', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'City name where this zone applies'
    },
    zone_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Zone name within the city'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    base_delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Base delivery fee for this zone'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
     }
  }, {
    timestamps: true,
    indexes: [
      { name: 'idx_delivery_zone_city_name', fields: ['city_name'] },
      { name: 'idx_delivery_zone_zone_name', fields: ['zone_name'] },
      { name: 'idx_delivery_zone_is_active', fields: ['is_active'] }
    ]
  });

  return DeliveryZone;
}; 
  