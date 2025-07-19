import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';

export default function ShopDetails() {
  const { phone_number } = useLocalSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vendorInfo, setVendorInfo] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchVendorInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`);
      setVendorInfo(res.data.vendorInfo);
      setProducts(res.data.products);
      // Fetch categories for this vendor by phone number (public endpoint, no auth)
      const catRes = await axios.get(`${BACKEND_URL}/api/vendor/categories/public-categories-by-phone/${phone_number}`);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching vendor info:', err);
      Alert.alert('Error', 'Failed to load shop data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (phone_number) {
      fetchVendorInfo();
    }
  }, [phone_number]);

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <ScrollView className="bg-white">
      {/* Header */}
      <View className="relative">
        <Image
          source={{ uri: vendorInfo?.banner || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <Pressable
          onPress={() => router.back()}
          className="absolute top-10 left-4 bg-white p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
      </View>

      {/* Shop Info */}
      <View className="bg-white mx-auto w-[85%] -mt-10 px-6  pt-4 rounded-t-3xl rounded-b-3xl shadow">
        <View className="flex-row items-center">
          <Image
            source={{ uri: vendorInfo?.logo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
            className="w-14 h-14 rounded-md mr-3"
          />
          <View>
            <Text className="text-xl text-primary font-bold">{vendorInfo?.shop_name || "...loading"}</Text>
            <Text className="text-xs text-primary ">{vendorInfo?.category || "...loading"}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-yellow-500">⭐ {vendorInfo?.rating || "...loading" }</Text>
              <Text className="text-xs text-primary  ml-1">
                ({vendorInfo?.ratingCount || 0})
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap mt-4 items-center gap-2">
          <Text className="text-sm text-primary ">{vendorInfo?.deliveryTime || '20 - 30 mins'}</Text>
          <Text className="text-sm text-primary ">• 🚴 EGP {vendorInfo?.deliveryFee || 18.99}</Text>
          <Text className="text-sm text-primary ">• Delivered by you</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-8 mb-4 px-4"
      >
        <Pressable
          key="all"
          onPress={() => setSelectedCategory('all')}
          className={`mr-4 pb-2 border-b-2 ${selectedCategory === 'all' ? 'border-primary' : 'border-transparent'}`}
        >
          <Text className={`text-sm font-medium ${selectedCategory === 'all' ? 'text-primary' : 'text-gray-500'}`}>All</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.name)}
            className={`mr-4 pb-2 border-b-2 ${selectedCategory === cat.name ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-sm font-medium ${selectedCategory === cat.name ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-bold mb-5">
          {selectedCategory === 'all'
            ? 'All Products'
            : selectedCategory}
        </Text>

        {loading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0f9d58" />
            <Text className="mt-4 text-primary font-semibold">Loading products...</Text>
          </View>
        ) : filteredProducts?.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <View className="w-[48%] bg-white mb-4 rounded-xl overflow-hidden shadow">
                <Image
                  source={{ uri: item.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
                  className="w-full h-28"
                  resizeMode="cover"
                />
                <View className="p-2 flex-row justify-between items-center">
                  <Text className="font-semibold text-sm text-black" numberOfLines={2}>{item.name}</Text>
                  <Text className="font-semibold text-sm text-green-600" numberOfLines={1}>{parseFloat(item.price).toFixed(2)}</Text>
                </View>
                <Pressable onPress={() => addToCart(item)}>
                  <Text className="text-primary">Add to Cart</Text>
                </Pressable>
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <Ionicons name="cart-outline" size={48} color="#d1d5db" />
            <Text className="mt-4 text-gray-400 font-semibold">No products available in this category.</Text>
          </View>
        )}
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
