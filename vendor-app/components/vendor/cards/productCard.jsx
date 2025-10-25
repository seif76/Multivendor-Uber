import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function ProductCard({ product, onEdit ,onDelete }) {
  return (
    <View className="flex-row items-center bg-white border border-gray-200 mb-3 p-3 rounded-xl shadow-sm">
      <Image
        source={{ uri: product.image }}
        className="w-16 h-16 rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-black">{product.name}</Text>
        <Text className="text-sm text-gray-600">{product.price} EGP</Text>
      </View>
      {/* <Pressable className="bg-primary px-3 py-1 rounded-full" onPress={() => onEdit(product)}>
        <Text className="text-white text-sm font-semibold">Edit</Text>
      </Pressable> */}
      <Pressable className="bg-primary px-3 py-1 rounded-full mr-2" onPress={() => onEdit(product)}>
        <Text className="text-white" >Edit</Text>
     </Pressable>
     <Pressable className="bg-red-500 px-3 py-1 rounded-full" onPress={() => onDelete(product.id)}>
        <Text className="text-white">Delete</Text>
    </Pressable>
    </View>
  );
}
