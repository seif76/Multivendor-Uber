import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import AddProductForm from '../custom/addProductForm';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function AddProductScreen() {
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/products/create-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add product');
      Alert.alert('Success', 'Product added');
      router.back(); // Go back to products screen
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Add New Product</Text>
      <AddProductForm onSubmit={handleSubmit} submitText="Add Product" />
    </View>
  );
}
