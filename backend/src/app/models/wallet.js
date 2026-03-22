const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    debt: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    is_frozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'When true — wallet cannot make payments or withdrawals',
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Wallet;
};
