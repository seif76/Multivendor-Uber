const { Chat, ChatMessage, User } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllChats = async (page = 1, limit = 10, status = null, chatType = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (chatType) {
      whereClause.chat_type = chatType;
    }

    console.log('Fetching chats with whereClause:', whereClause);

    const { count, rows } = await Chat.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_message_at', 'DESC']]
    });

    console.log(`Found ${count} chats, returning ${rows.length} rows`);

    // If no chats found, return empty result
    if (rows.length === 0) {
      return {
        chats: [],
        totalPages: 0,
        currentPage: page,
        totalChats: 0
      };
    }

    // Get participant details separately to avoid complex associations
    const chatsWithDetails = await Promise.all(
      rows.map(async (chat) => {
        try {
          const chatData = chat.toJSON();
          console.log('Processing chat:', chatData.id, 'participant1_id:', chatData.participant1_id, 'participant1_type:', chatData.participant1_type);
          
          // Get participant1 details (usually the customer/vendor/captain)
          let participant1 = null;
          let participant1Details = null;
          
          if (chatData.participant1_id) {
            participant1 = await User.findByPk(chatData.participant1_id, {
              attributes: ['id', 'name', 'phone_number', 'email', 'vendor_status', 'customer_status', 'captain_status', 'profile_photo', 'rating']
            });
            console.log('Found participant1:', participant1 ? participant1.name : 'NOT FOUND');
            chatData.participant1 = participant1;
            
            // Get additional details based on participant type
            if (chatData.participant1_type === 'vendor') {
              const { VendorInfo } = require('../../../app/models');
              participant1Details = await VendorInfo.findOne({
                where: { vendor_id: chatData.participant1_id },
                attributes: ['shop_name', 'shop_location', 'owner_name', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo']
              });
              console.log('Found vendor details:', participant1Details ? participant1Details.shop_name : 'NOT FOUND');
              chatData.vendor_details = participant1Details;
            } else if (chatData.participant1_type === 'customer') {
              // For customers, we might want to get their order history
              const { Order } = require('../../../app/models');
              const recentOrders = await Order.findAll({
                where: { customer_id: chatData.participant1_id },
                order: [['createdAt', 'DESC']],
                limit: 3,
                attributes: ['id', 'status', 'total_price', 'createdAt']
              });
              console.log('Found customer orders:', recentOrders.length);
              chatData.customer_orders = recentOrders;
            }
          }

          // Get participant2 details (usually admin/support)
          if (chatData.participant2_id) {
            const participant2 = await User.findByPk(chatData.participant2_id, {
              attributes: ['id', 'name', 'phone_number', 'email']
            });
            console.log('Found participant2:', participant2 ? participant2.name : 'NOT FOUND');
            chatData.participant2 = participant2;
          }

          // Get last message using the correct field name 'content'
          const lastMessage = await ChatMessage.findOne({
            where: { chat_id: chat.id },
            order: [['createdAt', 'DESC']],
            attributes: ['content', 'createdAt', 'sender_id', 'sender_type']
          });

          console.log('Found last message:', lastMessage ? lastMessage.content : 'NO MESSAGES');
          chatData.last_message = lastMessage?.content || 'No messages yet';
          
          // Get sender details for last message
          if (lastMessage?.sender_id) {
            const lastMessageSender = await User.findByPk(lastMessage.sender_id, {
              attributes: ['id', 'name', 'phone_number']
            });
            console.log('Found last message sender:', lastMessageSender ? lastMessageSender.name : 'NOT FOUND');
            chatData.last_message_sender = lastMessageSender;
          }
          
          // Use the actual participant types from the database
          let userType = chatData.participant1_type || 'unknown';
          let userName = 'Unknown User';
          let userPhone = '';
          let userEmail = '';
          let userStatus = '';

          if (chatData.participant1) {
            userName = chatData.participant1.name || 'Unknown User';
            userPhone = chatData.participant1.phone_number || '';
            userEmail = chatData.participant1.email || '';
            
            // Get the appropriate status based on user type
            if (chatData.participant1_type === 'vendor') {
              userStatus = chatData.participant1.vendor_status || 'none';
            } else if (chatData.participant1_type === 'customer') {
              userStatus = chatData.participant1.customer_status || 'none';
            } else if (chatData.participant1_type === 'captain') {
              userStatus = chatData.participant1.captain_status || 'none';
            } else {
              userStatus = 'unknown';
            }
          }

          console.log('Final user data:', { userName, userType, userPhone, userStatus });

          // Format data for frontend
          chatData.user_name = userName;
          chatData.user_type = userType;
          chatData.user_phone = userPhone;
          chatData.user_email = userEmail;
          chatData.user_status = userStatus;
          chatData.updated_at = chatData.last_message_at || chatData.createdAt;

          // Add navigation context if available
          if (chatData.context_id && chatData.context_type) {
            chatData.navigation_context = {
              id: chatData.context_id,
              type: chatData.context_type,
              url: `/${chatData.context_type}s/details?id=${chatData.context_id}`
            };
          }
          console.log('Final chat data   issss:', chatData);
          return chatData;
        } catch (error) {
          console.error('Error processing chat:', chat.id, error);
          // Return a basic chat object if there's an error
          return {
            id: chat.id,
            user_name: 'Unknown User',
            user_type: 'unknown',
            user_phone: '',
            user_email: '',
            user_status: '',
            chat_type: chat.chat_type || 'general',
            status: chat.status || 'active',
            last_message: 'Error loading chat',
            updated_at: chat.createdAt || new Date()
          };
        }
      })
    );

    return {
      chats: chatsWithDetails,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalChats: count
    };
  } catch (error) {
    console.error('Error in getAllChats:', error);
    // Return empty result instead of throwing error
    return {
      chats: [],
      totalPages: 0,
      currentPage: page,
      totalChats: 0
    };
  }
};

const getChatMessages = async (chatId) => {
  try {
    console.log('Fetching messages for chat:', chatId);
    
    const messages = await ChatMessage.findAll({
      where: { chat_id: chatId },
      order: [['createdAt', 'ASC']]
    });

    console.log(`Found ${messages.length} messages for chat ${chatId}`);

    // Get sender details separately
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        try {
          const messageData = message.toJSON();
          console.log('Processing message:', messageData.id, 'sender_id:', messageData.sender_id, 'sender_type:', messageData.sender_type, 'content:', messageData.content);
          
          // Use the sender_type from the database, not determine it from sender_id
          if (messageData.sender_id) {
            const sender = await User.findByPk(messageData.sender_id, {
              attributes: ['id', 'name', 'phone_number']
            });
            messageData.sender = sender;
            console.log('Found sender:', sender ? sender.name : 'NOT FOUND');
          } else {
            console.log('No sender_id, this is an admin message');
          }

          // Map the message content to 'message' for frontend compatibility
          messageData.message = messageData.content;
          
          // Map sender_type to frontend expected format
          if (messageData.sender_type === 'admin' || messageData.sender_type === 'support') {
            messageData.sender_type = 'admin';
            messageData.sender_name = 'Admin';
          } else {
            messageData.sender_type = 'user';
            messageData.sender_name = messageData.sender?.name || 'Unknown User';
          }

          console.log('Final message data:', {
            id: messageData.id,
            message: messageData.message,
            sender_type: messageData.sender_type,
            sender_name: messageData.sender_name,
            createdAt: messageData.createdAt
          });

          return messageData;
        } catch (error) {
          console.error('Error processing message:', message.id, error);
          return {
            id: message.id,
            message: message.content || 'Error loading message',
            sender_type: 'unknown',
            sender_name: 'Unknown',
            createdAt: message.createdAt || new Date()
          };
        }
      })
    );

    console.log(`Returning ${messagesWithSenders.length} processed messages`);
    return messagesWithSenders;
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    return [];
  }
};

const sendAdminMessage = async (chatId, message) => {
  try {
    const newMessage = await ChatMessage.create({
      chat_id: chatId,
      content: message, // Use 'content' field
      sender_id: null, // Admin message (no sender)
      sender_type: 'admin', // Set sender type directly
      message_type: 'text',
      is_read: false
    });

    // Update chat status to 'active' if it was 'closed'
    await Chat.update(
      { status: 'active', last_message_at: new Date() },
      { where: { id: chatId, status: 'closed' } }
    );

    return newMessage;
  } catch (error) {
    console.error('Error in sendAdminMessage:', error);
    throw new Error(`Failed to send admin message: ${error.message}`);
  }
};

const updateChatStatus = async (chatId, status) => {
  try {
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    await chat.update({ status });
    return chat;
  } catch (error) {
    console.error('Error in updateChatStatus:', error);
    throw new Error(`Failed to update chat status: ${error.message}`);
  }
};

const getChatStats = async () => {
  try {
    const totalChats = await Chat.count();
    const activeChats = await Chat.count({ where: { status: 'active' } });
    const resolvedChats = await Chat.count({ where: { status: 'resolved' } });
    const closedChats = await Chat.count({ where: { status: 'closed' } });

    return {
      total: totalChats,
      active: activeChats,
      resolved: resolvedChats,
      closed: closedChats
    };
  } catch (error) {
    console.error('Error in getChatStats:', error);
    return {
      total: 0,
      active: 0,
      resolved: 0,
      closed: 0
    };
  }
};

const searchChats = async (query, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // First get chats that might match the query
    const chats = await Chat.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_message_at', 'DESC']]
    });

    // Filter chats based on participant names/phone numbers
    const filteredChats = await Promise.all(
      chats.map(async (chat) => {
        try {
          const chatData = chat.toJSON();
          
          // Get participant details
          if (chatData.participant1_id) {
            const participant1 = await User.findByPk(chatData.participant1_id, {
              attributes: ['id', 'name', 'phone_number', 'email']
            });
            chatData.participant1 = participant1;
          }

          if (chatData.participant2_id) {
            const participant2 = await User.findByPk(chatData.participant2_id, {
              attributes: ['id', 'name', 'phone_number', 'email']
            });
            chatData.participant2 = participant2;
          }

          return chatData;
        } catch (error) {
          console.error('Error processing chat in search:', chat.id, error);
          return chat.toJSON();
        }
      })
    );

    // Filter by query
    const matchingChats = filteredChats.filter(chat => {
      const participant1Name = chat.participant1?.name || '';
      const participant1Phone = chat.participant1?.phone_number || '';
      const participant2Name = chat.participant2?.name || '';
      const participant2Phone = chat.participant2?.phone_number || '';

      return participant1Name.toLowerCase().includes(query.toLowerCase()) ||
             participant1Phone.includes(query) ||
             participant2Name.toLowerCase().includes(query.toLowerCase()) ||
             participant2Phone.includes(query);
    });

    return {
      chats: matchingChats,
      totalPages: Math.ceil(matchingChats.length / limit),
      currentPage: page,
      totalChats: matchingChats.length
    };
  } catch (error) {
    console.error('Error in searchChats:', error);
    return {
      chats: [],
      totalPages: 0,
      currentPage: page,
      totalChats: 0
    };
  }
};

module.exports = {
  getAllChats,
  getChatMessages,
  sendAdminMessage,
  updateChatStatus,
  getChatStats,
  searchChats
}; 