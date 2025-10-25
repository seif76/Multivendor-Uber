import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function CustomerChatListPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BACKEND_URL}/api/chat/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participant1 || chat.participant2;
  };

  const getLastMessage = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return chat.messages[0];
    }
    return null;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatItem = ({ item: chat }) => {
    const otherParticipant = getOtherParticipant(chat);
    const lastMessage = getLastMessage(chat);
    const isOrderChat = chat.chat_type === 'order' && chat.context_id;

    return (
      <Pressable
        onPress={() => {
          console.log('Chat item pressed:', chat);
          console.log('Other participant:', otherParticipant);
          console.log('Is order chat:', isOrderChat);
          
          // Navigate to the singlechat folder with chatId
          router.push({
            pathname: '/customer/singlechat/[chatId]',
            params: { 
              chatId: chat.id,
              vendorName: otherParticipant?.name || 'Vendor',
              orderId: isOrderChat ? chat.context_id : null
            }
          });
        }}
        className="flex-row items-center p-4 border-b border-gray-100 bg-white"
      >
        <View className="relative">
          <Ionicons name="chatbubble-outline" size={24} color="#007233" />
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-800 text-base">
                {otherParticipant.name}
              </Text>
              {isOrderChat && (
                <Text className="text-xs text-blue-600 font-medium">
                  Order #{chat.context_id} • Support
                </Text>
              )}
            </View>
            {lastMessage && (
              <Text className="text-xs text-gray-500 ml-2">
                {formatTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          {lastMessage ? (
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
              {lastMessage.content}
            </Text>
          ) : (
            <Text className="text-sm text-gray-400 mt-1 italic">
              {isOrderChat ? 'Order support chat - no messages yet' : 'No messages yet'}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="mt-2 text-gray-600">{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-500 text-center mt-2">{error}</Text>
        <Pressable
          onPress={fetchChats}
          className="mt-4 bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">{t('navigation.chat')}</Text>
        <Pressable
          onPress={() => router.push('/customer/orders')}
          className="p-2 bg-primary rounded-full"
        >
          <Ionicons name="list" size={20} color="white" />
        </Pressable>
      </View>
      
      {chats.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 text-center mt-4 text-lg font-semibold">
            {t('chat.noChats')}
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            {t('chat.startConversation')}
          </Text>
          <Pressable
            onPress={() => router.push('/customer/orders')}
            className="mt-4 bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">{t('orders.viewOrders')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchChats}
        />
      )}
    </SafeAreaView>
  );
} 