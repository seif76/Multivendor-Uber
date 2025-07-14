import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function CategorySlider() {
  const router = useRouter();
  const categories = [
    { icon: 'shopping-bag', label: 'Fashion' },
    { icon: 'laptop', label: 'Electronics' },
    { icon: 'cutlery', label: 'Food' },
    { icon: 'home', label: 'Home' },
    { icon: 'heartbeat', label: 'Health' },
  ];

  return (
    <View className="px-4 py-2">
      <Text className="text-lg font-bold mb-3 text-gray-800">Shop by Category</Text>
      <Pressable onPress={() => router.push("/customer/shop")} className="bg-primary mb-3 w-full py-3 rounded-lg items-center">
            <Text className="text-white text-lg">see shop</Text>
        </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
        {categories.map(({ icon, label }, i) => (
          <View key={i} className="items-center bg-gray-100 px-4 py-3 rounded-xl mr-3">
            <FontAwesome name={icon} size={24} color="#0f9d58" />
            <Text className="mt-2 text-sm">{label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
