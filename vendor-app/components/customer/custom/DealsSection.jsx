import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useHome } from '../../../context/customer/HomeContext';

export default function DealsSection() {
  const router = useRouter();
  const { featuredProducts, loading, error } = useHome();

  const handleProductPress = (product) => {
    // Navigate to product details or vendor shop
    router.push(`/customer/shopDetails/${product.vendor_id}`);
  };

  const getProductImage = (product) => {
    // Use product image if available, otherwise use default
    if (product.image) {
      return { uri: product.image };
    }
    return require('../../../assets/images/Elnaizak-logo.jpeg');
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Best Deals</Text>
        <View className="flex-row items-center justify-center py-8">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-gray-600 ml-2">Loading deals...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Best Deals</Text>
        <View className="bg-red-50 p-4 rounded-lg">
          <Text className="text-red-800 text-sm text-center">{error}</Text>
        </View>
      </View>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Best Deals</Text>
        <View className="bg-gray-50 p-6 rounded-lg">
          <Text className="text-gray-500 text-center">No deals available at the moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-800">Best Deals</Text>
        <Pressable onPress={() => router.push('/customer/shop/shop')}>
          <Text className="text-primary font-semibold">See All</Text>
        </Pressable>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
        {featuredProducts.slice(0, 4).map((product) => (
          <Pressable 
            key={product.id} 
            onPress={() => handleProductPress(product)}
            className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-3 mr-3"
          >
            <View className="relative">
              <Image
                source={getProductImage(product)}
                className="w-full h-32 rounded-lg"
                resizeMode="cover"
              />
              {product.stock > 0 && (
                <View className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">In Stock</Text>
                </View>
              )}
            </View>
            
            <View className="mt-3">
              <Text className="font-semibold text-gray-800" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                {product.description}
              </Text>
              
              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center">
                  <Text className="text-primary font-bold text-lg">
                    {formatPrice(product.price)}
                  </Text>
                  {product.stock > 0 && (
                    <Text className="text-xs text-gray-400 ml-2">
                      ({product.stock} left)
                    </Text>
                  )}
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text className="text-xs text-gray-600 ml-1">4.5</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
