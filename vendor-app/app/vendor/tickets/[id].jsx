import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable,
  ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const STATUS_CONFIG = {
  open:        { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  in_progress: { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  resolved:    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  closed:      { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
};

export default function VendorTicketDetailPage() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/tickets/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const found = res.data.find(t => t.id === parseInt(id));
        setTicket(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Ticket not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-5 py-2 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary font-semibold text-base">← Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-800">Ticket #{ticket.id}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Status */}
        <View className={`flex-row items-center gap-2 px-4 py-3 rounded-xl mb-4 ${cfg.bg}`}>
          <View className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <Text className={`font-semibold capitalize ${cfg.text}`}>
            {ticket.status.replace('_', ' ')}
          </Text>
        </View>

        {/* Details Card */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-1">{ticket.subject}</Text>
          <Text className="text-xs text-gray-400 capitalize mb-3">
            {ticket.category.replace(/_/g, ' ')} · {new Date(ticket.createdAt).toLocaleDateString()}
          </Text>
          <Text className="text-sm text-gray-700 leading-5">{ticket.message}</Text>
        </View>

        {/* Admin Note */}
        {ticket.admin_note && (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
            <Text className="text-sm font-bold text-green-700 mb-1">Admin Response</Text>
            <Text className="text-sm text-green-800">{ticket.admin_note}</Text>
          </View>
        )}

        {ticket.status === 'open' && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <Text className="text-sm text-yellow-700 text-center">
              ⏳ Your ticket is open and will be reviewed soon.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}