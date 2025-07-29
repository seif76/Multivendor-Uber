const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_type: {
      type: DataTypes.ENUM('customer', 'vendor', 'captain', 'admin', 'support'),
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // For media messages
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.STRING, // 'image', 'document', etc.
      allowNull: true,
    },
    // Message status
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // System messages (order updates, etc.)
    system_action: {
      type: DataTypes.STRING, // 'order_status', 'ride_status', etc.
      allowNull: true,
    },
    system_data: {
      type: DataTypes.JSON, // Additional data for system messages
      allowNull: true,
    },
  });

  return ChatMessage;
}; 