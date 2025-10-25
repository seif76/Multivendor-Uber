import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

export default function CreateChat({ onChatCreated, onCancel }) {
  const [participantId, setParticipantId] = useState('');
  const [participantType, setParticipantType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const participantTypes = [
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'captain', label: 'Captain' },
    { value: 'admin', label: 'Admin' },
    { value: 'support', label: 'Support' },
  ];

  const createChat = async () => {
    if (!participantId.trim()) {
      Alert.alert('Error', 'Please enter a participant ID');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(
        `${BACKEND_URL}/api/chat/chats`,
        {
          participantId: parseInt(participantId),
          participantType,
          chatType: 'general',
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (onChatCreated) {
        onChatCreated(response.data);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-gray-800">New Chat</Text>
        <Pressable onPress={onCancel}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </Pressable>
      </View>

      <View className="space-y-4">
        {/* Participant ID */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Participant ID
          </Text>
          <TextInput
            value={participantId}
            onChangeText={setParticipantId}
            placeholder="Enter participant ID"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>

        {/* Participant Type */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Participant Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {participantTypes.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => setParticipantType(type.value)}
                className={`px-4 py-2 rounded-full border ${
                  participantType === type.value
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    participantType === type.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mt-6">
          <Pressable
            onPress={onCancel}
            className="flex-1 bg-gray-200 py-3 rounded-lg"
          >
            <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
          </Pressable>
          
          <Pressable
            onPress={createChat}
            disabled={loading || !participantId.trim()}
            className={`flex-1 py-3 rounded-lg ${
              loading || !participantId.trim() ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Start Chat
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
} 