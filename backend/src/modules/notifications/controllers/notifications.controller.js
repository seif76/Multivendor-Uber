const { sendPushNotification } = require('../services/notifications.service');

// Test notification endpoint
const testNotificationController = async (req, res) => {
  try {
    const { title, body, data, pushToken, icon, color } = req.body;
    
    // Check if push token is provided
    if (!pushToken) {
      return res.status(400).json({ 
        error: 'Push token is required. Please provide a valid Expo push token.' 
      });
    }
    
    // Default test notification data
    const notificationData = {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from the backend!',
      data: data || { 
        type: 'test',
        timestamp: new Date().toISOString(),
        message: 'Hello from the server!'
      }
    };

    // Use the actual push token from the request
    const result = await sendPushNotification(pushToken, notificationData);
    
    res.status(200).json({
      message: 'Test notification sent successfully',
      notification: notificationData,
      pushToken: pushToken,
      result: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
};

// Send notification to specific user
const sendNotificationToUserController = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    
    if (!userId || !title || !body) {
      return res.status(400).json({ 
        error: 'userId, title, and body are required' 
      });
    }

    // In real implementation, you'd fetch the user's push token from database
    const userToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'; // Replace with actual token from DB
    
    const notificationData = {
      title,
      body,
      data: data || {}
    };

    const result = await sendPushNotification(userToken, notificationData);
    
    res.status(200).json({
      message: 'Notification sent successfully',
      userId,
      notification: notificationData,
      result: result
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
};

// Get notification history (for testing)
const getNotificationHistoryController = async (req, res) => {
  try {
    // Mock notification history
    const history = [
      {
        id: 1,
        title: 'Test Notification 1',
        body: 'This is a test notification',
        sentAt: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: 2,
        title: 'Test Notification 2',
        body: 'Another test notification',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'sent'
      }
    ];

    res.status(200).json({
      message: 'Notification history retrieved',
      history
    });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({ 
      error: 'Failed to get notification history',
      details: error.message 
    });
  }
};

// Postman test endpoint with hardcoded token
const postmanTestNotificationController = async (req, res) => {
  try {
    const { title, body, data, pushToken, icon, color } = req.body;
    
    // Default test notification data
    const notificationData = {
      title: title || 'Postman Test Notification',
      body: body || 'This is a test notification from Postman!',
      icon: icon || 'bell', // Custom icon
      color: color || '#22c55e', // Icon color
      data: data || { 
        type: 'postman_test',
        timestamp: new Date().toISOString(),
        message: 'Hello from Postman!'
      }
    };

    // You can replace this with your actual push token for testing
    const testToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'; // Replace with your real token
    
    console.log('Postman test - using hardcoded token:', testToken);
    console.log('Postman test - notification data:', notificationData);
    
    const result = await sendPushNotification(pushToken, notificationData);
    
    res.status(200).json({
      message: 'Postman test notification sent successfully',
      notification: notificationData,
      pushToken: pushToken,
      result: result,
      note: 'This endpoint uses a hardcoded token for Postman testing'
    });
  } catch (error) {
    console.error('Error sending postman test notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
};

module.exports = {
  testNotificationController,
  postmanTestNotificationController,
  sendNotificationToUserController,
  getNotificationHistoryController,
};
