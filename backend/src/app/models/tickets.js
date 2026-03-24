const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Ticket = sequelize.define('Ticket', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('customer', 'vendor', 'deliveryman'),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
            'order_issue',
            'payment_issue',
            'delivery_issue',
            'account_issue',
            'payout_issue',
            'product_issue',
            'order_management',
            'vehicle_issue',
            'other'
        ),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open',
        allowNull: false,
      },
      admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    }, {
      timestamps: true,
      indexes: [
        { name: 'idx_ticket_user_id',  fields: ['user_id'] },
        { name: 'idx_ticket_role',     fields: ['role'] },
        { name: 'idx_ticket_status',   fields: ['status'] },
        { name: 'idx_ticket_category', fields: ['category'] },
      ]
    });
  
    return Ticket;
  };