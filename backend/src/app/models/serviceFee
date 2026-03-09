module.exports = (sequelize, DataTypes) => {
    const ServiceFee = sequelize.define('ServiceFee', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fee_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage',
        comment: 'Whether the fee is a percentage of the order or a fixed amount'
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Fee value — percentage (e.g. 5.00 = 5%) or fixed amount'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }, {
      timestamps: true,
    });
  
    return ServiceFee;
  };