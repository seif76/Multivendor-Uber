import React from 'react';
import { View, Text } from 'react-native';

export default function DeliverymanInbox() {
  return (
    <View className="flex-1 bg-white p-4 pt-8">
      <Text className="text-2xl font-bold text-blue-600 mb-6">Inbox</Text>
      <Text className="text-gray-500">No messages in inbox</Text>
    </View>
  );
}
