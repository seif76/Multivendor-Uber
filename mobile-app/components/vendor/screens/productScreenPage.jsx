import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { RefreshControl } from 'react-native';
import ProductCard from '../cards/productCard';
import ProductSearchBar from '../searchInputs/productSearchBar';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;



export default function VendorProductsScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/vendor/products/get-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/vendor/products/delete-product/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (product) => {
    router.push({
      pathname: '/vendor/edit-product',
      params: { product: JSON.stringify(product) },
    });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Your Products</Text>

      <ProductSearchBar search={search} onChange={setSearch} />

      {/* {loading ? (
        <ActivityIndicator size="large" color="#0f9d58" className="mt-10" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-10">No products found.</Text>
          )}
        </ScrollView>
      )} */}
      {loading && !refreshing ? (
  <ActivityIndicator size="large" color="#0f9d58" className="mt-10" />
) : (
  <ScrollView
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchProducts();
          setRefreshing(false);
        }}
        colors={['#0f9d58']}
      />
    }
  >
    {filteredProducts.length > 0 ? (
      filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))
    ) : (
      <Text className="text-center text-gray-500 mt-10">
        No products found.
      </Text>
    )}
  </ScrollView>
)}

      <Pressable
        className="absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-lg"
        onPress={() => router.push('/vendor/add-product')}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
