import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';


const STATUS_CONFIG = {
  open:        { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  in_progress: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  resolved:    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  closed:      { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

export default function CustomerTicketsPage() {
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
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/customer/ticketdetail?id=${item.id}`)}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#f3f4f6',
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1f2937', flex: 1, marginRight: 8 }} numberOfLines={1}>
            {item.subject}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.dot }} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: cfg.text, textTransform: 'capitalize' }}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize', marginBottom: 6 }}>
          {item.category.replace(/_/g, ' ')}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7280' }} numberOfLines={2}>{item.message}</Text>
        <Text style={{ fontSize: 11, color: '#d1d5db', marginTop: 8 }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#4CAF50', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>My Tickets</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/customer/createticket')}
            style={{ backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
          >
            <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 13 }}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={
            error ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
                <MaterialIcons name="error-outline" size={48} color="#fca5a5" />
                <Text style={{ color: '#ef4444', marginBottom: 12, marginTop: 8 }}>{error}</Text>
                <Pressable onPress={() => fetchTickets()} style={{ backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
                <MaterialIcons name="support-agent" size={64} color="#d1d5db" />
                <Text style={{ fontSize: 18, color: '#9ca3af', fontWeight: '600', marginTop: 12 }}>No tickets yet</Text>
                <Text style={{ fontSize: 13, color: '#d1d5db', marginTop: 4 }}>Pull down to refresh or tap + New</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
        }