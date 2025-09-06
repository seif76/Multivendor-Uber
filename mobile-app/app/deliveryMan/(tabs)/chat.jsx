import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

export default function DeliverymanChatPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      // This would be the actual endpoint for deliveryman chats
      // const res = await axios.get(`${BACKEND_URL}/api/deliveryman/chats`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      // Mock data for now
      const mockChats = [
        {
          id: 1,
          customer_id: 1,
          customer_name: 'Ahmed Mohamed',
          customer_phone: '01012345678',
          last_message: 'Where are you? I\'m waiting for my order.',
          last_message_time: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          unread_count: 2,
          order_id: 1,
          order_number: 'ORD-001',
          customer_avatar: 'https://via.placeholder.com/50'
        },
        {
          id: 2,
          customer_id: 2,
          customer_name: 'Sara Ali',
          customer_phone: '01087654321',
          last_message: 'Thank you for the quick delivery!',
          last_message_time: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          unread_count: 0,
          order_id: 2,
          order_number: 'ORD-002',
          customer_avatar: 'https://via.placeholder.com/50'
        },
        {
          id: 3,
          customer_id: 3,
          customer_name: 'Mohamed Hassan',
          customer_phone: '01055555555',
          last_message: 'Can you please call me when you arrive?',
          last_message_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          unread_count: 1,
          order_id: 3,
          order_number: 'ORD-003',
          customer_avatar: 'https://via.placeholder.com/50'
        }
      ];
      
      setChats(mockChats);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch chats');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const renderChat = ({ item }) => (
    <Pressable
      className="bg-white rounded-2xl shadow p-4 mb-3 border border-gray-100"
      onPress={() => router.push(`/deliveryMan/chat/${item.id}`)}
    >
      <View className="flex-row items-center">
        {/* Customer Avatar */}
        <View className="relative">
          <Image
            source={{ uri: item.customer_avatar }}
            className="w-14 h-14 rounded-full border-2 border-blue-200"
          />
          {item.unread_count > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">{item.unread_count}</Text>
            </View>
          )}
        </View>

        {/* Chat Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-lg font-semibold text-gray-800">{item.customer_name}</Text>
            <Text className="text-xs text-gray-500">{formatTime(item.last_message_time)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm text-gray-600">Order: {item.order_number}</Text>
            <Text className="text-xs text-gray-500">{item.customer_phone}</Text>
          </View>
          
          <Text 
            className={`text-sm ${item.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
            numberOfLines={2}
          >
            {item.last_message}
          </Text>
        </View>

        {/* Arrow Icon */}
        <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-blue-600">Messages</Text>
        <Pressable onPress={fetchChats} className="bg-blue-600 px-4 py-2 rounded-xl">
          <FontAwesome name="refresh" size={16} color="white" />
        </Pressable>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-blue-600 font-semibold">Loading messages...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-2">{error}</Text>
          <Pressable onPress={fetchChats} className="bg-blue-600 px-6 py-2 rounded-xl mt-2">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : chats.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome name="comments" size={48} color="#d1d5db" />
          <Text className="text-gray-400 font-semibold text-lg mt-4">No messages yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Customer messages will appear here during deliveries
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderChat}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
