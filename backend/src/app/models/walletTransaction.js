const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('payment', 'earning', 'refund', 'withdrawal', 'topup', 'adjustment'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Order ID, withdrawal request ID, etc.'
    },
    reference_type: {
      type: DataTypes.ENUM('order', 'withdrawal', 'topup', 'adjustment'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'completed',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin ID for manual adjustments'
    }
  }, {
    indexes: [
      { name: 'idx_wallet_transaction_wallet_id', fields: ['wallet_id'] },
      { name: 'idx_wallet_transaction_type', fields: ['type'] },
      { name: 'idx_wallet_transaction_reference', fields: ['reference_id', 'reference_type'] },
      { name: 'idx_wallet_transaction_created_at', fields: ['createdAt'] }
    ]
  });

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.Wallet, {
      foreignKey: 'wallet_id',
      as: 'wallet',
    });
    WalletTransaction.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return WalletTransaction;
};
