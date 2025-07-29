const { Chat, ChatMessage, User } = require('../../../app/models');
const { Op } = require('sequelize');

// Create or find existing chat between two participants
async function createOrFindChat(
  participant1Id,
  participant1Type,
  participant2Id,
  participant2Type,
  chatType = 'general',
  contextId = null,
  contextType = null
) {
  const existingChat = await Chat.findOne({
    where: {
      [Op.or]: [
        {
          participant1_id: participant1Id,
          participant1_type: participant1Type,
          participant2_id: participant2Id,
          participant2_type: participant2Type,
        },
        {
          participant1_id: participant2Id,
          participant1_type: participant2Type,
          participant2_id: participant1Id,
          participant2_type: participant1Type,
        },
      ],
      chat_type: chatType,
    },
  });

  if (existingChat) {
    return existingChat;
  }

  const newChat = await Chat.create({
    participant1_id: participant1Id,
    participant1_type: participant1Type,
    participant2_id: participant2Id,
    participant2_type: participant2Type,
    chat_type: chatType,
    context_id: contextId,
    context_type: contextType,
  });

  return newChat;
}

// Get all chats for a user
async function getUserChats(userId, userType) {
  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { participant1_id: userId, participant1_type: userType },
        { participant2_id: userId, participant2_type: userType },
      ],
    },
    include: [
      {
        model: User,
        as: 'participant1',
        attributes: ['id', 'name', 'profile_photo'],
      },
      {
        model: User,
        as: 'participant2',
        attributes: ['id', 'name', 'profile_photo'],
      },
      {
        model: ChatMessage,
        as: 'messages',
        limit: 1,
        order: [['createdAt', 'DESC']],
      },
    ],
    order: [['last_message_at', 'DESC']],
  });

  return chats;
}

// Get chat messages
async function getChatMessages(chatId, limit = 50, offset = 0) {
  const messages = await ChatMessage.findAll({
    where: { chat_id: chatId },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'profile_photo'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return messages.reverse(); // Return in chronological order
}

// Send message
async function sendMessage(
  chatId,
  senderId,
  senderType,
  content,
  messageType = 'text',
  mediaUrl = null,
  mediaType = null
) {
  const message = await ChatMessage.create({
    chat_id: chatId,
    sender_id: senderId,
    sender_type: senderType,
    content,
    message_type: messageType,
    media_url: mediaUrl,
    media_type: mediaType,
  });

  // Update chat's last_message_at
  await Chat.update(
    { last_message_at: new Date() },
    { where: { id: chatId } }
  );

  // Return message with sender info
  const messageWithSender = await ChatMessage.findByPk(message.id, {
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'profile_photo'],
      },
    ],
  });

  return messageWithSender;
}

// Mark messages as read
async function markMessagesAsRead(chatId, userId) {
  await ChatMessage.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        chat_id: chatId,
        sender_id: { [Op.ne]: userId }, // Messages not sent by this user
        is_read: false,
      },
    }
  );
}

// Get unread message count
async function getUnreadCount(userId, userType) {
  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { participant1_id: userId, participant1_type: userType },
        { participant2_id: userId, participant2_type: userType },
      ],
    },
    include: [
      {
        model: ChatMessage,
        as: 'messages',
        where: {
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
        required: false,
      },
    ],
  });

  let totalUnread = 0;
  chats.forEach(chat => {
    totalUnread += chat.messages.length;
  });

  return totalUnread;
}

// Get chat by ID with participants
async function getChatById(chatId, userId, userType) {
  const chat = await Chat.findOne({
    where: {
      id: chatId,
      [Op.or]: [
        { participant1_id: userId, participant1_type: userType },
        { participant2_id: userId, participant2_type: userType },
      ],
    },
    include: [
      {
        model: User,
        as: 'participant1',
        attributes: ['id', 'name', 'profile_photo'],
      },
      {
        model: User,
        as: 'participant2',
        attributes: ['id', 'name', 'profile_photo'],
      },
    ],
  });

  return chat;
}

// Close chat
async function closeChat(chatId, userId, userType) {
  const chat = await getChatById(chatId, userId, userType);
  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  await Chat.update(
    { status: 'closed' },
    { where: { id: chatId } }
  );

  return chat;
}

// Create or find chat for order support
async function createOrFindOrderChat(customerId, orderId) {
  // First, get the order with vendor information
  const { Order, OrderItem, Product, User } = require('../../../app/models');
  
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ 
        model: Product, 
        as: 'product',
        include: [{ model: User, as: 'vendor' }]
      }],
    }],
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Get vendor ID from the first product (all products should be from same vendor)
  const vendorId = order.items[0]?.product?.vendor_id;
  if (!vendorId) {
    throw new Error('Vendor information not found for this order');
  }

  // Create or find existing chat for this order
  const existingChat = await Chat.findOne({
    where: {
      participant1_id: customerId,
      participant1_type: 'customer',
      participant2_id: vendorId,
      participant2_type: 'vendor',
      chat_type: 'order',
      context_id: orderId,
      context_type: 'order',
    },
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new chat
  const newChat = await Chat.create({
    participant1_id: customerId,
    participant1_type: 'customer',
    participant2_id: vendorId,
    participant2_type: 'vendor',
    chat_type: 'order',
    context_id: orderId,
    context_type: 'order',
  });

  return newChat;
}

// Get vendor information for an order
async function getOrderVendorInfo(orderId, customerId) {
  const { Order, OrderItem, Product, User } = require('../../../app/models');
  
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ 
        model: Product, 
        as: 'product',
        include: [{ model: User, as: 'vendor' }]
      }],
    }],
  });

  if (!order || !order.items.length) {
    throw new Error('Order not found or no items');
  }

  const vendor = order.items[0].product.vendor;
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorPhone: vendor.phone_number,
  };
}

module.exports = {
  createOrFindChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getChatById,
  closeChat,
  createOrFindOrderChat,
  getOrderVendorInfo,
};