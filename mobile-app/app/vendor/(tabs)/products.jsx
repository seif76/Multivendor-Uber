import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function VendorProductsScreen() {
  const products = [
    {
      id: 1,
      name: 'Chocolate Cake',
      price: '120 EGP',
      image: 'https://images.unsplash.com/photo-1599785209798-4392f97f3c1c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Baklava Box',
      price: '85 EGP',
      image: 'https://images.unsplash.com/photo-1590502593741-bcc0bd96f1ce?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Products</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {products.map((product) => (
          <View
            key={product.id}
            className="flex-row items-center bg-gray-50 border border-gray-200 mb-4 p-3 rounded-xl shadow-sm"
          >
            <Image
              source={{ uri: product.image }}
              className="w-16 h-16 rounded-lg mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-black">{product.name}</Text>
              <Text className="text-sm text-gray-600">{product.price}</Text>
            </View>
            <Pressable className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-semibold">Edit</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Pressable className="absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-lg">
        <AntDesign name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
