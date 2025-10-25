import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function InboxScreen() {
  const messages = [
    { id: 1, name: 'Customer Support', lastMsg: 'Your request has been received.', unread: true },
    { id: 2, name: 'John Doe', lastMsg: 'Can you confirm delivery time?', unread: false },
    { id: 3, name: 'Sarah Ali', lastMsg: 'Thanks for the fast delivery!', unread: false },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Inbox</Text>

      {messages.map((msg) => (
        <Pressable
          key={msg.id}
          className={`flex-row items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-4 mb-3 ${
            msg.unread ? 'shadow-md' : ''
          }`}
        >
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="account-circle" size={30} color="#007233" />
            <View>
              <Text className="text-base font-semibold">{msg.name}</Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {msg.lastMsg}
              </Text>
            </View>
          </View>
          {msg.unread && <View className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
        </Pressable>
      ))}
    </ScrollView>
  );
}
