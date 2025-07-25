import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View, ActivityIndicator } from 'react-native';
import ProductForm from '../custom/productForm';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function EditProductScreen({ product }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/api/vendor/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch (err) {
        // Optionally handle error
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

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
      const res = await fetch(`${BACKEND_URL}/api/vendor/products/update-product/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type here; let fetch set it automatically for FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update product');
      Alert.alert('Success', 'Product updated');
      router.push('/vendor/products');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  if (loadingCategories) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f9d58" />
        <Text className="mt-4 text-primary font-semibold">Loading categories...</Text>
      </View>
    );
  }

  // Pass initial image as an object for preview
  const initialProduct = {
    ...product,
    image: product.image ? { uri: product.image, name: 'product.jpg', type: 'image/jpeg', isInitial: true } : null,
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl">
        <Text className="text-xl font-bold text-primary mb-4">Edit Product</Text>
        <ProductForm
          onSubmit={handleSubmit}
          submitText="Update Product"
          initialValues={initialProduct}
          categories={categories}
        />
      </View>
    </View>
  );
}
