import { View, Text, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function SupportLinks() {
  return (
    <View className="flex-row justify-between mb-8">
      <Pressable className="flex-1 bg-pink-100 rounded-xl py-4 items-center mx-1">
        <FontAwesome name="headphones" size={24} color="#d63384" />
        <Text className="text-pink-700 font-semibold mt-2">Live Support</Text>
      </Pressable>
      <Pressable className="flex-1 bg-yellow-100 rounded-xl py-4 items-center mx-1">
        <FontAwesome name="exclamation-triangle" size={24} color="#e67e22" />
        <Text className="text-yellow-700 font-semibold mt-2">Report Issue</Text>
      </Pressable>
    </View>
  );
} 