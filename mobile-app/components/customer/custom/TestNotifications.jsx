import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TestNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(false);
  const [lastSentNotification, setLastSentNotification] = useState(null);

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('Initializing notifications...');
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.log('Token set in state:', token);
      } else {
        console.error('Failed to get push token');
      }
    };

    initializeNotifications();

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    try {
      console.log('Starting push notification registration...');
      console.log('Platform:', Platform.OS);
      console.log('Is Device:', Device.isDevice);

      if (Platform.OS === 'android') {
        console.log('Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        console.log('Getting notification permissions...');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('Existing permission status:', existingStatus);
        
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          console.log('Requesting notification permissions...');
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log('New permission status:', finalStatus);
        }
        
        if (finalStatus !== 'granted') {
          console.error('Notification permission denied');
          Alert.alert('Permission Denied', 'Failed to get push token for push notification!');
          return null;
        }
        
        console.log('Getting Expo push token...');
        const projectID = "15338084-685c-4264-99de-fdb718447b98";
        token = (
            await Notifications.getExpoPushTokenAsync({
              projectId: projectID,
            })
          ).data;
        console.log('Expo Push Token generated:', token);
      } else {
        console.warn('Not running on a physical device');
        Alert.alert('Device Required', 'Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error during push notification registration:', error);
      Alert.alert('Registration Error', `Failed to register for push notifications: ${error.message}`);
      return null;
    }

    return token;
  }

  const sendTestNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'Push token not available. Please wait for it to be generated.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/notifications/test`, {
        title: 'Test Notification',
        body: 'This is a test notification from the backend!',
        pushToken: expoPushToken, // Send the actual push token
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
          message: 'Hello from the server!'
        }
      });

      console.log('Notification sent successfully!', response.data);
     // alert(response.data.notification.body);
      try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Local Test Notification",
          body: response.data.notification.body,
          data: { data: 'goes here' },
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      Alert.alert('Error', 'Failed to schedule local notification: ' + error.message);
    }

    //   setLastSentNotification({
    //     title: 'Test Notification',
    //     body: 'This is a test notification from the backend!',
    //     sentAt: new Date().toISOString()
    //   });
      // Don't show alert - let the push notification appear naturally
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Local Test Notification",
        body: 'This is a local notification test!',
        data: { data: 'goes here' },
      },
      trigger: { seconds: 2 },
    });
  };

  return (
    <View className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <Text className="text-lg font-bold text-gray-800 mb-4">Test Notifications</Text>
      
      {/* Push Token Display */}
      <View className="mb-4 p-3 bg-gray-100 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700 mb-1">Expo Push Token:</Text>
        <Text className="text-xs text-gray-600" numberOfLines={3}>
          {expoPushToken || 'Getting token...'}
        </Text>
        {expoPushToken && (
          <Text className="text-xs text-green-600 mt-1">
            ✅ Token generated successfully
          </Text>
        )}
        {!expoPushToken && (
          <Text className="text-xs text-yellow-600 mt-1">
            ⏳ Waiting for token generation...
          </Text>
        )}
      </View>

      {/* Test Buttons */}
      <View className="space-y-3">
        <Pressable
          onPress={sendTestNotification}
          disabled={loading}
          className={`py-3 px-4 rounded-xl items-center ${
            loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Send Test Notification (Backend)</Text>
          )}
        </Pressable>

        <Pressable
          onPress={sendLocalNotification}
          className="py-3 px-4 rounded-xl items-center bg-green-600"
        >
          <Text className="text-white font-semibold">Send Local Notification</Text>
        </Pressable>
      </View>

      {/* Last Sent Notification Status */}
      {lastSentNotification && (
        <View className="mt-4 p-3 bg-green-50 rounded-lg">
          <Text className="text-sm font-semibold text-green-800 mb-1">Last Sent Notification:</Text>
          <Text className="text-xs text-green-700">
            {lastSentNotification.title}: {lastSentNotification.body}
          </Text>
          <Text className="text-xs text-green-600 mt-1">
            Sent at: {new Date(lastSentNotification.sentAt).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Received Notification Status */}
      {notification && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm font-semibold text-blue-800 mb-1">Last Received Notification:</Text>
          <Text className="text-xs text-blue-700">
            {notification.request.content.title}: {notification.request.content.body}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <Text className="text-sm font-semibold text-yellow-800 mb-1">Instructions:</Text>
        <Text className="text-xs text-yellow-700">
          1. Make sure you're on a physical device{'\n'}
          2. Grant notification permissions{'\n'}
          3. Click "Send Test Notification" - you should see a push notification appear{'\n'}
          4. Click "Send Local Notification" to test local notifications{'\n'}
          5. Check your device's notification tray for received notifications
        </Text>
      </View>
    </View>
  );
}
