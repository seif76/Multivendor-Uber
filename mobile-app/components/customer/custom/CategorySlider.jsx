import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useHome } from '../../../context/customer/HomeContext';

export default function CategorySlider() {
  const router = useRouter();
  const { categories, loading, error } = useHome();

  // Default categories as fallback
  const defaultCategories = [
    { icon: 'shopping-bag', label: 'Fashion', iconType: 'FontAwesome' },
    { icon: 'laptop', label: 'Electronics', iconType: 'FontAwesome' },
    { icon: 'restaurant', label: 'Food', iconType: 'Ionicons' },
    { icon: 'home', label: 'Home', iconType: 'FontAwesome' },
    { icon: 'medical', label: 'Health', iconType: 'Ionicons' },
  ];

  const getCategoryIcon = (category) => {
    if (category.iconType === 'Ionicons') {
      return <Ionicons name={category.icon} size={24} color="#007233" />;
    }
    return <FontAwesome name={category.icon} size={24} color="#007233" />;
  };

  const handleCategoryPress = (category) => {
    // Navigate to shop with category filter
    alert("coming soon");
  };

 // const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  if (loading) {
    return (
      <View className="px-4 py-2">
        <Text className="text-lg font-bold mb-3 text-gray-800">Shop by Category</Text>
        <View className="flex-row items-center justify-center py-4">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-gray-600 ml-2">Loading categories...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 py-2">
        <Text className="text-lg font-bold mb-3 text-gray-800">Shop by Category</Text>
        <View className="bg-red-50 p-3 rounded-lg mb-3">
          <Text className="text-red-800 text-sm text-center">{error}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
          {defaultCategories.map((category, i) => (
            <Pressable 
              key={i} 
              onPress={() => handleCategoryPress(category)}
              className="items-center bg-gray-100 px-4 py-3 rounded-xl mr-3"
            >
              {/* {getCategoryIcon(category)} */}
              <Text className="text-2xl">{category.icon}</Text>
              <Text className="mt-2 text-sm text-gray-700">{category.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-800">Shop by Category</Text>
        <Pressable onPress={() => router.push("/customer/shop/shop")}>
          <Text className="text-primary font-semibold">See All</Text>
        </Pressable>
      </View>
      
      <Pressable 
        onPress={() => router.push("/customer/shop/shop")} 
        className="bg-primary mb-3 w-full py-3 rounded-lg items-center"
      >
        <Text className="text-white text-lg font-semibold">Browse All Stores</Text>
      </Pressable>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
        {defaultCategories.map((category, i) => (
          <Pressable 
            key={i} 
            onPress={() => handleCategoryPress(category)}
            className="items-center bg-gray-100 px-4 py-3 rounded-xl mr-3"
          >
            {/* {getCategoryIcon(category)} */}
            <Text className="text-2xl">{category.iconType === 'Ionicons' ? <Ionicons name={category.icon} size={24} color="#007233" /> : <FontAwesome name={category.icon} size={24} color="#007233" />}</Text>
            <Text className="mt-2 text-sm text-gray-700" numberOfLines={1}>
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
