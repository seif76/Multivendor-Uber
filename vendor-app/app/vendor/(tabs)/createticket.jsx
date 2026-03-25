import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CATEGORIES = [
  { key: 'order_management', label: 'Order Management' },
  { key: 'payout_issue',     label: 'Payout Issue' },
  { key: 'product_issue',    label: 'Product Issue' },
  { key: 'account_issue',    label: 'Account Issue' },
  { key: 'other',            label: 'Other' },
];

export default function NewVendorTicketPage() {
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
        { role: 'vendor', category, subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Your ticket has been submitted.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary font-semibold text-base">← Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-800">New Ticket</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Category */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Category <Text className="text-red-400">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-xl border ${
                  category === cat.key
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  category === cat.key ? 'text-white' : 'text-gray-600'
                }`}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Subject */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Subject <Text className="text-red-400">*</Text>
          </Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief summary of your issue"
            placeholderTextColor="#9ca3af"
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
          />
        </View>

        {/* Message */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Message <Text className="text-red-400">*</Text>
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            style={{ minHeight: 140 }}
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`py-4 rounded-2xl items-center ${submitting ? 'bg-gray-300' : 'bg-primary'}`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Submit Ticket</Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}