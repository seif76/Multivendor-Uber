const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

// Send push notification
const sendPushNotification = async (pushToken, notificationData) => {
  try {
    console.log('Sending push notification to token:', pushToken);
    console.log('Notification data:', notificationData);
    
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      throw new Error('Invalid push token');
    }

    // Construct the message
    const message = {
      to: pushToken,
      sound: 'default',
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data,
      priority: 'high',
      channelId: 'default',
      icon: notificationData.icon || 'ic_notification', // Custom icon
      color: notificationData.color || '#22c55e', // Icon color (Android)
    };

    console.log('Constructed message:', message);

    // Send the notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        console.log('Sending chunk:', chunk);
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Received tickets:', ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        throw error;
      }
    }

    console.log('All tickets:', tickets);
    return {
      success: true,
      tickets: tickets,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    throw error;
  }
};

// Send push notification to multiple tokens
const sendPushNotificationToMultiple = async (pushTokens, notificationData) => {
  try {
    // Filter out invalid tokens
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      throw new Error('No valid push tokens provided');
    }

    // Construct messages for all tokens
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data,
      priority: 'high',
      channelId: 'default',
    }));

    // Send the notifications
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        throw error;
      }
    }

    return {
      success: true,
      tickets: tickets,
      validTokensCount: validTokens.length,
      message: `Notifications sent to ${validTokens.length} devices`
    };
  } catch (error) {
    console.error('Error in sendPushNotificationToMultiple:', error);
    throw error;
  }
};

// Check notification receipts
const checkNotificationReceipts = async (tickets) => {
  try {
    const receiptIds = tickets
      .filter(ticket => ticket.id)
      .map(ticket => ticket.id);

    if (receiptIds.length === 0) {
      return { message: 'No receipts to check' };
    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = [];

    for (let chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(...Object.values(receiptChunk));
      } catch (error) {
        console.error('Error getting push notification receipts:', error);
        throw error;
      }
    }

    return {
      success: true,
      receipts: receipts,
      message: 'Receipts retrieved successfully'
    };
  } catch (error) {
    console.error('Error in checkNotificationReceipts:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultiple,
  checkNotificationReceipts,
};
