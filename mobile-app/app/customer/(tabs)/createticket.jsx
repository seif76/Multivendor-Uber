import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CATEGORIES = [
  { key: 'order_issue',    label: 'Order Issue' },
  { key: 'payment_issue',  label: 'Payment Issue' },
  { key: 'delivery_issue', label: 'Delivery Issue' },
  { key: 'account_issue',  label: 'Account Issue' },
  { key: 'other',          label: 'Other' },
];

export default function CustomerCreateTicketPage() {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleSubmit = async () => {
    if (!category || !subject.trim() || !message.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/tickets`,
        { role: 'customer', category, subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategory('');
      setSubject('');
      setMessage('');
      Alert.alert('Submitted!', 'Your ticket has been submitted. We will get back to you soon.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#4CAF50', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>New Ticket</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Category */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 }}>
          Category <Text style={{ color: '#ef4444' }}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: category === cat.key ? '#4CAF50' : '#e5e7eb',
                backgroundColor: category === cat.key ? '#4CAF50' : 'white',
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: category === cat.key ? 'white' : '#6b7280',
              }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
          Subject <Text style={{ color: '#ef4444' }}>*</Text>
        </Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief summary of your issue"
          placeholderTextColor="#9ca3af"
          style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 14,
            color: '#1f2937',
            marginBottom: 20,
          }}
        />

        {/* Message */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
          Message <Text style={{ color: '#ef4444' }}>*</Text>
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue in detail..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 14,
            color: '#1f2937',
            minHeight: 140,
            marginBottom: 24,
          }}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#9ca3af' : '#4CAF50',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}