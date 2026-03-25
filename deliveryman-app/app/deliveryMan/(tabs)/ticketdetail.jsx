import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#16a34a';

const STATUS_CONFIG = {
  open:        { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  in_progress: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  resolved:    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  closed:      { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

export default function DeliverymanTicketDetailPage() {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <Text style={{ color: '#9ca3af' }}>Ticket not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: PRIMARY, paddingTop: 15, paddingBottom: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Ticket #{ticket.id}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: cfg.bg, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 16, alignSelf: 'flex-start' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.dot }} />
          <Text style={{ fontWeight: '600', color: cfg.text, textTransform: 'capitalize' }}>
            {ticket.status.replace('_', ' ')}
          </Text>
        </View>

        {/* Ticket Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6' }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
            {ticket.subject}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize', marginBottom: 12 }}>
            {ticket.category.replace(/_/g, ' ')} · {new Date(ticket.createdAt).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 22 }}>{ticket.message}</Text>
        </View>

        {/* Admin Response */}
        {ticket.admin_note && (
          <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <MaterialIcons name="support-agent" size={18} color={PRIMARY} />
              <Text style={{ fontWeight: 'bold', color: PRIMARY, fontSize: 14 }}>Support Response</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>{ticket.admin_note}</Text>
          </View>
        )}

        {ticket.status === 'open' && (
          <View style={{ backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 16, padding: 16 }}>
            <Text style={{ textAlign: 'center', color: '#92400e', fontSize: 13 }}>
              ⏳ Your ticket is under review. We'll respond shortly.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}