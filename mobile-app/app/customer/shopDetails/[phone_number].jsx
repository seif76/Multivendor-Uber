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
  const [showWorkingHours, setShowWorkingHours] = useState(false);

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchVendorInfo = async () => {
    setLoading(true);
    
    // Set a fallback timeout in case the API hangs
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback timeout triggered - API taking too long');
      setLoading(false);
    }, 10000); // 10 second fallback
    
    try {
      console.log('Fetching vendor info for:', phone_number);
      console.log('API URL:', `${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`);
      
      const res = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`, {
        timeout: 8000, // 8 second timeout for this specific request
      });
      
      console.log('Vendor API response:', res.data);
      setVendorInfo(res.data.vendorInfo || {});
      setProducts(res.data.products || []);
      setFilteredProducts(res.data.products || []);
      
      // Clear the fallback timeout since we got a response
      clearTimeout(fallbackTimeout);
      
      // Fetch categories for this vendor by phone number (public endpoint, no auth)
      try {
        const catRes = await axios.get(`${BACKEND_URL}/api/vendor/categories/public-categories-by-phone/${phone_number}`);
        setCategories(catRes.data || []);
      } catch (catErr) {
        console.log('Categories not available, using empty array');
        setCategories([]);
      }
      
      // Fetch working hours and open status if vendorId is available
      const vendorId = res.data.vendorInfo?.vendor_id;
      if (vendorId) {
        try {
          const whRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/working-hours`);
          setWorkingHours(whRes.data || []);
        } catch (whErr) {
          console.log('Working hours not available');
          setWorkingHours([]);
        }
        
        try {
          const openRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/is-open`);
          setIsOpen(openRes.data?.isOpen);
        } catch (openErr) {
          console.log('Open status not available');
          setIsOpen(null);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor info:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      // Clear the fallback timeout
      clearTimeout(fallbackTimeout);
      
      // Show more specific error message
      const errorMessage = err.response?.status === 404 
        ? 'Vendor not found' 
        : err.response?.status === 500 
        ? 'Server error - please try again' 
        : 'Failed to load shop data';
        
      // Don't show alert for 404, just show empty state
      if (err.response?.status !== 404) {
        Alert.alert('Error', errorMessage);
      }
      
      // Set fallback data for better UX
      setVendorInfo({
        shop_name: 'Vendor Not Found',
        category: 'Unknown',
        logo: null,
        shop_front_photo: null
      });
      setProducts([]);
      setFilteredProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
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
    <View className="flex-1 bg-gray-50">
      <ScrollView>
      {/* Header with Hero Image */}
      <View className="relative">
        <Image
          source={{ uri: vendorInfo?.shop_front_photo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/20" />
        <Pressable
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-white/90 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
      </View>

      {/* Shop Info Card */}
      <View className="bg-white mx-4 -mt-8 rounded-2xl shadow-sm border border-gray-100">
        <View className="p-4">
          <View className="flex-row items-start">
            <Image
              source={{ uri: vendorInfo?.logo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
              className="w-16 h-16 rounded-xl mr-4 border-2 border-gray-100"
            />
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">{vendorInfo?.shop_name || "Shop Name"}</Text>
              <Text className="text-sm text-gray-600 mb-2">{vendorInfo?.category || "General"}</Text>
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text className="text-sm font-semibold text-gray-800 ml-1">{vendorInfo?.rating || "4.5"}</Text>
                  <Text className="text-xs text-gray-500 ml-1">({vendorInfo?.ratingCount || 0})</Text>
                </View>
                <Pressable 
                  onPress={() => {
                    if (isOpen === false && workingHours.length > 0) {
                      setShowWorkingHours(!showWorkingHours);
                    }
                  }}
                  className={`ml-3 px-2 py-1 rounded-lg ${isOpen === null ? 'bg-gray-100' : isOpen ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <View className="flex-row items-center">
                    {isOpen === null && (
                      <ActivityIndicator size="small" color="#6b7280" style={{ marginRight: 4 }} />
                    )}
                    <Text className={`text-xs font-semibold ${isOpen === null ? 'text-gray-500' : isOpen ? 'text-green-700' : 'text-red-700'}`}>
                      {isOpen === null ? 'Checking...' : isOpen ? 'Open Now' : 'Closed'}
                    </Text>
                    {isOpen === false && workingHours.length > 0 && (
                      <Ionicons name="chevron-down" size={12} color="#ef4444" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Working Hours Section */}
          {showWorkingHours && workingHours.length > 0 && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Working Hours:</Text>
              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => {
                const intervals = workingHours.filter(h => h.day_of_week === i);
                return (
                  <View key={day} className="flex-row items-center mb-1">
                    <Text className="w-20 text-xs text-gray-600 font-medium">{day}:</Text>
                    {intervals.length === 0 ? (
                      <Text className="text-xs text-gray-400 ml-2">Closed</Text>
                    ) : (
                      intervals.map((intv, idx) => (
                        <Text key={idx} className="text-xs text-gray-700 ml-2">
                          {intv.open_time} - {intv.close_time}{idx < intervals.length - 1 ? ',' : ''}
                        </Text>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Delivery Info */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">{vendorInfo?.deliveryTime || '20-30 mins'}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">EGP {vendorInfo?.deliveryFee || 18.99}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-4 px-4"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <Pressable
          key="all"
          onPress={() => setSelectedCategoryId('all')}
          className={`mr-3 px-4 py-2 rounded-full ${selectedCategoryId === 'all' ? 'bg-green-100' : 'bg-gray-100'}`}
        >
          <Text className={`text-sm font-medium ${selectedCategoryId === 'all' ? 'text-green-700' : 'text-gray-600'}`}>All</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategoryId(cat.id)}
            className={`mr-3 px-4 py-2 rounded-full ${String(selectedCategoryId) === String(cat.id) ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            <Text className={`text-sm font-medium ${String(selectedCategoryId) === String(cat.id) ? 'text-green-700' : 'text-gray-600'}`}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View className="px-4 mt-2">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          {selectedCategoryId === 'all'
            ? 'All Products'
            : categories.find(cat => String(cat.id) === String(selectedCategoryId))?.name}
        </Text>

        {filteredProducts?.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => addToCart(item)}
                className="w-[48%] bg-white mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <View className="relative">
                  <View className="w-full h-32 bg-gray-50 justify-center items-center">
                    <Image
                      source={{ uri: item?.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-gray-700">EGP {parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text className="font-semibold text-sm text-gray-900 mb-1" numberOfLines={2}>{item.name}</Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1}>{item.description || 'Product description'}</Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text className="text-xs text-gray-600 ml-1">4.5</Text>
                    </View>
                    <Pressable className="bg-green-100 p-1 rounded-full">
                      <Ionicons name="add" size={16} color="#10b981" />
                    </Pressable>
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
      <View className="h-20" />
    </ScrollView>
    </View>
  );
}
