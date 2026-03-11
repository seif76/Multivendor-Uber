const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DebtTransaction = sequelize.define('DebtTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Deliveryman wallet ID',
    },
    deliveryman_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Debt amount — vendor_fee the deliveryman owes to platform',
    },
    debt_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Deliveryman total debt before this transaction',
    },
    debt_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Deliveryman total debt after this transaction',
    },
    status: {
      type: DataTypes.ENUM('pending', 'settled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    settled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    indexes: [
      { name: 'idx_debt_transaction_wallet_id', fields: ['wallet_id'] },
      { name: 'idx_debt_transaction_deliveryman_id', fields: ['deliveryman_id'] },
      { name: 'idx_debt_transaction_order_id', fields: ['order_id'] },
      { name: 'idx_debt_transaction_status', fields: ['status'] },
    ],
  });

  DebtTransaction.associate = (models) => {
    DebtTransaction.belongsTo(models.Wallet, {
      foreignKey: 'wallet_id',
      as: 'wallet',
    });
    DebtTransaction.belongsTo(models.User, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
    DebtTransaction.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
    });
  };

  return DebtTransaction;
};