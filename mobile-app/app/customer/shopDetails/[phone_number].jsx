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
  TouchableOpacity,
} from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function ShopDetails() {
  const { phone_number } = useLocalSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [vendorInfo, setVendorInfo] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const [workingHours, setWorkingHours] = useState([]);
  const [isOpen, setIsOpen] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchVendorInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`);
      
      setVendorInfo(res.data.vendorInfo);
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
      // Fetch categories for this vendor by phone number (public endpoint, no auth)
      const catRes = await axios.get(`${BACKEND_URL}/api/vendor/categories/public-categories-by-phone/${phone_number}`);
      
      setCategories(catRes.data);
      // Fetch working hours and open status if vendorId is available
      const vendorId = res.data.vendorInfo?.vendor_id
      if (vendorId) {
        const whRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/working-hours`);
        setWorkingHours(whRes.data);
        const openRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/is-open`);
        setIsOpen(openRes.data?.isOpen);
      }
    } catch (err) {
      console.error('Error fetching vendor info:', err);
      Alert.alert('Error', 'Failed to load shop data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (phone_number) {
      fetchVendorInfo();
      setSelectedCategoryId('all');
    }
  }, [phone_number]);

  useEffect(() => {
   
    if (selectedCategoryId === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => String(p.vendor_category_id) === String(selectedCategoryId)));
    }
  }, [selectedCategoryId]); 

  // Filter products by selected category

  return (
    <ScrollView className="bg-white">
      {/* Header */}
      <View className="relative">
        <Image
          source={{ uri: vendorInfo?.shop_front_photo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
          className="w-full h-56"
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
      <View className="bg-white mx-auto w-[85%] -mt-20 px-6  pt-4 rounded-t-3xl rounded-b-3xl shadow">
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
        {/* Open/Closed Status */}
        <View className="flex-row items-center mt-3 mb-1">
          <MaterialIcons name={isOpen ? 'check-circle' : 'cancel'} size={18} color={isOpen === null ? '#aaa' : isOpen ? '#22c55e' : '#ef4444'} />
          <Text className={`ml-2 font-bold ${isOpen === null ? 'text-gray-400' : isOpen ? 'text-green-600' : 'text-red-500'}`}>{isOpen === null ? 'Checking...' : isOpen ? 'Open Now' : 'Closed'}</Text>
        </View>
        {/* Working Hours */}
        {workingHours.length > 0 && (
          <View className="mt-2 mb-1">
            <Text className="text-xs text-gray-500 font-semibold mb-1">Working Hours:</Text>
            {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => {
              const intervals = workingHours.filter(h => h.day_of_week === i);
              return (
                <View key={day} className="flex-row items-center mb-1 ml-1">
                  <Text className="w-20 text-xs text-gray-700">{day}:</Text>
                  {intervals.length === 0 ? (
                    <Text className="text-xs text-gray-400 ml-1">Closed</Text>
                  ) : (
                    intervals.map((intv, idx) => (
                      <Text key={idx} className="text-xs text-gray-700 ml-1">
                        {intv.open_time} - {intv.close_time}{idx < intervals.length - 1 ? ',' : ''}
                      </Text>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}

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
          onPress={() => setSelectedCategoryId('all')}
          className={`mr-4 pb-2 border-b-2 ${selectedCategoryId === 'all' ? 'border-primary' : 'border-transparent'}`}
        >
          <Text className={`text-sm font-medium ${selectedCategoryId === 'all' ? 'text-primary' : 'text-gray-500'}`}>All</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategoryId(cat.id)}
            className={`mr-4 pb-2 border-b-2 ${String(selectedCategoryId) === String(cat.id) ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-sm font-medium ${String(selectedCategoryId) === String(cat.id) ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-bold mb-5">
          {selectedCategoryId === 'all'
            ? 'All Products'
            : categories.find(cat => String(cat.id) === String(selectedCategoryId))?.name}
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
              <TouchableOpacity
                onPress={() => addToCart(item)}
              className="w-[48%] bg-white mb-4 rounded-xl overflow-hidden shadow"
              >
              <View 
              className="w-full bg-white mb-4 rounded-xl overflow-hidden shadow">
                <View style={{ width: '100%', height: 112, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={{ uri: item?.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
                <View className="p-2 flex-row justify-between items-center">
                  <Text className="font-semibold text-sm text-black" numberOfLines={2}>{item.name}</Text>
                  <Text className="font-semibold text-sm text-green-600" numberOfLines={1}>{parseFloat(item.price).toFixed(2)}</Text>
                </View>
                
              </View>
        </TouchableOpacity>              
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
