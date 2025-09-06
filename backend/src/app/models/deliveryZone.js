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
    distance_km: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      comment: 'Distance in kilometers from city center'
    },
    delivery_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Estimated delivery time in minutes'
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Minimum order amount for free delivery in this zone'
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
  