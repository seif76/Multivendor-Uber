const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const adminWallet = sequelize.define('adminWallet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  
  return adminWallet;
};
