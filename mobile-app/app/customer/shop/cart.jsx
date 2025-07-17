import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, total } = useContext(CartContext);

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Your Cart</Text>
      <Pressable onPress={() => router.push('/customer/shop/shop')} className="mt-10 ml-4 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-4 border-b pb-2">
            <Text className="font-bold">{item.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            <Text>Price: EGP {item.price}</Text>
            <Pressable onPress={() => removeFromCart(item.id)}>
              <Text className="text-red-500">Remove</Text>
            </Pressable>
          </View>
        )}
      />

      <View className="mt-6">
        <Text className="text-lg font-bold">Total: EGP {total.toFixed(2)}</Text>
        <Pressable className="bg-primary py-3 mt-4 rounded">
          <Text className="text-center text-white font-semibold">Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}
