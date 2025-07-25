import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View, ActivityIndicator } from 'react-native';
import AddProductForm from '../custom/addProductForm';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function AddProductScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image') formData.append(key, value);
      });
      if (data.image && data.image.uri) {
        formData.append('image', {
          uri: data.image.uri,
          name: data.image.name || 'product.jpg',
          type: data.image.type || 'image/jpeg',
        });
      }
      const res = await fetch(`${BACKEND_URL}/api/vendor/products/create-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type here; let fetch set it automatically for FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add product');
      Alert.alert('Success', 'Product added');
      router.back(); // Go back to products screen
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0f9d58" className="mt-10" />;

  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl">
        <Text className="text-xl font-bold text-primary mb-4">Add New Product</Text>
        <AddProductForm onSubmit={handleSubmit} categories={categories} submitText="Add Product" />
      </View>
    </View>
  );
}
