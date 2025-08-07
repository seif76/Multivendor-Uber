const { 
  getAllChats, 
  getChatMessages, 
  sendAdminMessage, 
  updateChatStatus,
  getChatStats,
  searchChats
} = require('../services/support.service');

const getAllChatsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, chat_type } = req.query;
    const chats = await getAllChats(page, limit, status, chat_type);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error in getAllChatsController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getChatMessagesController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error in getChatMessagesController:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendAdminMessageController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sentMessage = await sendAdminMessage(chatId, message);
    res.status(200).json({ 
      message: 'Message sent successfully', 
      data: sentMessage 
    });
  } catch (error) {
    console.error('Error in sendAdminMessageController:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateChatStatusController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedChat = await updateChatStatus(chatId, status);
    res.status(200).json({ 
      message: 'Chat status updated successfully', 
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Error in updateChatStatusController:', error);
    res.status(500).json({ error: error.message });
  }
};

const getChatStatsController = async (req, res) => {
  try {
    const stats = await getChatStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getChatStatsController:', error);
    res.status(500).json({ error: error.message });
  }
};

const searchChatsController = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchChats(query, page, limit);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in searchChatsController:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllChatsController,
  getChatMessagesController,
  sendAdminMessageController,
  updateChatStatusController,
  getChatStatsController,
  searchChatsController
}; 