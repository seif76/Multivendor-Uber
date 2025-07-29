const {
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
} = require('../services/chat.service');

// Get all chats for the authenticated user
const getUserChatsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type; // Use userType from JWT token
    const chats = await getUserChats(userId, userType);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat messages
const getChatMessagesController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user has access to this chat
    const chat = await getChatById(chatId, userId, userType);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    const messages = await getChatMessages(chatId, parseInt(limit), parseInt(offset));
    
    // Mark messages as read
    await markMessagesAsRead(chatId, userId);
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message
const sendMessageController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', mediaUrl, mediaType } = req.body;
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Verify user has access to this chat
    const chat = await getChatById(chatId, userId, userType);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await sendMessage(
      chatId,
      userId,
      userType,
      content.trim(),
      messageType,
      mediaUrl,
      mediaType
    );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or find chat with another user
const createOrFindChatController = async (req, res) => {
  try {
    const { participantId, participantType, chatType = 'general', contextId, contextType } = req.body;
    const userId = req.user.id;
    const userType = req.user.user_type;

    if (!participantId || !participantType) {
      return res.status(400).json({ error: 'Participant ID and type are required' });
    }

    const chat = await createOrFindChat(
      userId,
      userType,
      participantId,
      participantType,
      chatType,
      contextId,
      contextType
    );

    // Get chat with participants info
    const chatWithParticipants = await getChatById(chat.id, userId, userType);

    res.status(200).json(chatWithParticipants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    const count = await getUnreadCount(userId, userType);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Close chat
const closeChatController    = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const chat = await closeChat(chatId, userId, userType);
    res.status(200).json({ message: 'Chat closed successfully', chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or find chat for order support
const createOrderChatController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    const chat = await createOrFindOrderChat(customerId, orderId);
    const vendorInfo = await getOrderVendorInfo(orderId, customerId);

    res.status(200).json({
      chat,
      vendorInfo,
      message: 'Chat created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get vendor info for order
const getOrderVendorInfoController = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    const vendorInfo = await getOrderVendorInfo(orderId, customerId);
    res.status(200).json(vendorInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single chat by ID
const getChatByIdController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const chat = await getChatById(chatId, userId, userType);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserChatsController,
  getChatMessagesController,
  sendMessageController,
  createOrFindChatController,
  getUnreadCountController,
  closeChatController,
  createOrderChatController,
  getOrderVendorInfoController,
  getChatByIdController,
}; 