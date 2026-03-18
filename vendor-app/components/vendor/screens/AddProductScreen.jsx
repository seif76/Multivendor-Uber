// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Constants from 'expo-constants';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { Alert, Text, View, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
// import AddProductForm from '../custom/addProductForm';


// export default function AddProductScreen() {
//   const router = useRouter();
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;



//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const res = await fetch(`${BACKEND_URL}/api/vendor/categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (res.ok) setCategories(data);
//     } catch {}
//     setLoading(false);
//   };

//   const handleSubmit = async (data) => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const formData = new FormData();
//       Object.entries(data).forEach(([key, value]) => {
//         if (key !== 'image') formData.append(key, value);
//       });
//       if (data.image && data.image.uri) {
//         formData.append('image', {
//           uri: data.image.uri,
//           name: data.image.name || 'product.jpg',
//           type: data.image.type || 'image/jpeg',
//         });
//       }
//       const res = await fetch(`${BACKEND_URL}/api/vendor/products/create-product`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           // Do NOT set Content-Type here; let fetch set it automatically for FormData
//         },
//         body: formData,
//       });

//       if (!res.ok) throw new Error('Failed to add product');
//       Alert.alert('Success', 'Product added');
//       router.back(); // Go back to products screen
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', err.message);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" color="#0f9d58" className="mt-10" />;

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//     <View className="flex-1 bg-white justify-center items-center px-4">
//       <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl">
//         <Text className="text-xl font-bold text-primary mb-4">Add New Product</Text>
//         <AddProductForm onSubmit={handleSubmit} categories={categories} submitText="Add Product" />
//       </View>
//     </View>
//      </TouchableWithoutFeedback>
//   );
// }
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import AddProductForm from '../custom/addProductForm';
import axios from 'axios';
import mime from "mime"; 

export default function AddProductScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/vendor/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

 

  const handleSubmit = async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
  
      if (data.name) formData.append('name', data.name);
      if (data.price) formData.append('price', data.price);
      if (data.description) formData.append('description', data.description);
      if (data.stock) formData.append('stock', data.stock);
      if (data.category) formData.append('vendor_category_id', data.category);
  
      // ── same method as vendor register ──
      if (data.image && data.image.uri) {
        const newImageUri = data.image.uri;
        const fileName = newImageUri.split("/").pop();
        const fileType = mime.getType(newImageUri);
        formData.append('image', { uri: newImageUri, type: fileType, name: fileName });
      }
  
      await axios.post(
        `${BACKEND_URL}/api/vendor/products/create-product`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      Alert.alert('Success', 'Product added');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#00A98F" />
        <Text className="text-gray-500 text-sm mt-3">Loading categories...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-5 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Add New Product</Text>
        <Text className="text-sm text-gray-500 mt-0.5">Fill in the details below to list a new product</Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00A98F']}
            tintColor="#00A98F"
          />
        }
      >
        <AddProductForm
          onSubmit={handleSubmit}
          categories={categories}
          submitText="Add Product"
        />
      </ScrollView>
    </View>
  );
}