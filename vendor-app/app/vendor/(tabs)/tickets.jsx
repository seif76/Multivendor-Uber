import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable,
  ActivityIndicator, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';

const STATUS_COLORS = {
  open:        'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
};

export default function VendorTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/tickets/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets(true);
  };

  const renderTicket = ({ item }) => {
    const colorClass = STATUS_COLORS[item.status] || STATUS_COLORS.open;
    return (
      <Pressable
        onPress={() => router.push(`/vendor/tickets/${item.id}`)}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={1}>
            {item.subject}
          </Text>
          <View className={`px-2.5 py-1 rounded-full ${colorClass.split(' ')[0]}`}>
            <Text className={`text-xs font-semibold capitalize ${colorClass.split(' ')[1]}`}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500 capitalize mb-1">
          {item.category.replace(/_/g, ' ')}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={2}>{item.message}</Text>
        <Text className="text-xs text-gray-400 mt-2">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-primary">My Tickets</Text>
        <Pressable
          onPress={() => router.push('/vendor/createticket')}
          className="bg-primary px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-bold">+ New</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0f9d58" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 mb-3">{error}</Text>
          <Pressable onPress={() => fetchTickets()} className="bg-primary px-5 py-2 rounded-xl">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : tickets.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg">No tickets yet.</Text>
          <Text className="text-gray-400 text-sm mt-1">Tap + New to submit one.</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTicket}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f9d58']} />
          }
        />
      )}
    </View>
  );
}