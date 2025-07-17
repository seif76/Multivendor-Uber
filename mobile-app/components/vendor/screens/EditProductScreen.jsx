import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import ProductForm from '../custom/productForm';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function EditProductScreen({ product }) {
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/products/update-product/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update product');
      Alert.alert('Success', 'Product updated');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Edit Product</Text>
      <ProductForm
        onSubmit={handleSubmit}
        submitText="Update Product"
        initialValues={product}
      />
    </View>
  );
}
