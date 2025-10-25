import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function CustomerChatScreen() {
  const { chatId, vendorName, orderId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef();
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    if (chatId) {
      fetchCurrentUser();
      fetchChatDetails();
      fetchMessages();
    }
  }, [chatId]);

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchChatDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(
        `${BACKEND_URL}/api/chat/chats/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setChat(response.data);
    } catch (err) {
      console.error('Error fetching chat details:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(
        `${BACKEND_URL}/api/chat/chats/${chatId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(
        `${BACKEND_URL}/api/chat/chats/${chatId}/messages`,
        {
          content: newMessage.trim(),
          messageType: 'text',
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item: message }) => {
    // Check if the current user is the sender of this message
    const isMyMessage = currentUser && message.sender_id === currentUser.id;

    return (
      <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3`}>
        <View
          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
            isMyMessage
              ? 'bg-primary rounded-br-md'
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          <Text
            className={`text-sm ${
              isMyMessage ? 'text-white' : 'text-gray-800'
            }`}
          >
            {message.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isMyMessage ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="mt-2 text-gray-600">Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-500 text-center mt-2">{error}</Text>
        <Pressable
          onPress={fetchMessages}
          className="mt-4 bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#007233" />
        </Pressable>
        
        <Image
          source={require('../../../assets/images/Elnaizak-logo.jpeg')}
          className="w-10 h-10 rounded-full"
        />
        
        <View className="flex-1 ml-3">
          <Text className="font-semibold text-gray-800 text-base">
            {vendorName || 'Vendor'}
          </Text>
          <Text className="text-xs text-gray-500">
            {orderId ? `Order #${orderId} • Support Chat` : 'Chat'}
          </Text>
        </View>

        {orderId && (
          <Pressable 
            onPress={() => router.push(`/customer/orders/${orderId}`)}
            className="p-2"
          >
            <Ionicons name="receipt-outline" size={20} color="#6b7280" />
          </Pressable>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4">
              No messages yet
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Start the conversation with the vendor!
            </Text>
          </View>
        }
      />

      {/* Message Input */}
      <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
          multiline
          maxLength={1000}
        />
        
        <Pressable
          onPress={sendMessage}
          disabled={sending || !newMessage.trim()}
          className={`p-2 rounded-full ${
            sending || !newMessage.trim() ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
} 