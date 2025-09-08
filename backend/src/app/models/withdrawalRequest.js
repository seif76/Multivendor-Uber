const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bank_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_holder_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
      defaultValue: 'pending',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin ID who processed the request'
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    indexes: [
      { name: 'idx_withdrawal_wallet_id', fields: ['wallet_id'] },
      { name: 'idx_withdrawal_status', fields: ['status'] },
      { name: 'idx_withdrawal_created_at', fields: ['createdAt'] }
    ]
  });

  WithdrawalRequest.associate = (models) => {
    WithdrawalRequest.belongsTo(models.Wallet, {
      foreignKey: 'wallet_id',
      as: 'wallet',
    });
    WithdrawalRequest.belongsTo(models.User, {
      foreignKey: 'processed_by',
      as: 'processor',
    });
  };

  return WithdrawalRequest;
};
