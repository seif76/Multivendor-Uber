const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Generic participant fields - can be any user type
    participant1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    participant1_type: {
      type: DataTypes.ENUM('customer', 'vendor', 'captain', 'admin', 'support'),
      allowNull: false,
    },
    participant2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    participant2_type: {
      type: DataTypes.ENUM('customer', 'vendor', 'captain', 'admin', 'support'),
      allowNull: false,
    },
    // Chat metadata
    chat_type: {
      type: DataTypes.ENUM('support', 'order', 'ride', 'general'),
      defaultValue: 'general',
    },
    status: {
      type: DataTypes.ENUM('active', 'resolved', 'closed'),
      defaultValue: 'active',
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Optional context for specific chat types
    context_id: {
      type: DataTypes.INTEGER, // order_id, ride_id, etc.
      allowNull: true,
    },
    context_type: {
      type: DataTypes.STRING, // 'order', 'ride', etc.
      allowNull: true,
    },
  });

  return Chat;
}; 