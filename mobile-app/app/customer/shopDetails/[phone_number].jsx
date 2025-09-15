// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import Constants from 'expo-constants';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useContext, useEffect, useState } from 'react';
// import {
//   Image,
//   Pressable,
//   ScrollView,
//   Text,
//   View,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
// } from 'react-native';
// import { CartContext } from '../../../context/customer/CartContext';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function ShopDetails() {
//   const { phone_number } = useLocalSearchParams();
//   const router = useRouter();
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedCategoryId, setSelectedCategoryId] = useState('all');
//   const [vendorInfo, setVendorInfo] = useState({});
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { addToCart } = useContext(CartContext);
//   const [workingHours, setWorkingHours] = useState([]);
//   const [isOpen, setIsOpen] = useState(null);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [showWorkingHours, setShowWorkingHours] = useState(false);

//   const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

//   const fetchVendorInfo = async () => {
//     setLoading(true);
    
//     // Set a fallback timeout in case the API hangs
//     const fallbackTimeout = setTimeout(() => {
//       console.log('Fallback timeout triggered - API taking too long');
//       setLoading(false);
//     }, 10000); // 10 second fallback
    
//     try {
//       console.log('Fetching vendor info for:', phone_number);
//       console.log('API URL:', `${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`);
      
//       const res = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`, {
//         timeout: 8000, // 8 second timeout for this specific request
//       });
      
//       console.log('Vendor API response:', res.data);
//       setVendorInfo(res.data.vendorInfo || {});
      
//       // Add vendor_id to each product
//       const productsWithVendorId = (res.data.products || []).map(product => ({
//         ...product,
//         vendor_id: res.data.vendorInfo?.vendor_id || res.data.vendorInfo?.id
//       }));
      
//       setProducts(productsWithVendorId);
//       setFilteredProducts(productsWithVendorId);
      
//       // Clear the fallback timeout since we got a response
//       clearTimeout(fallbackTimeout);
      
//       // Fetch categories for this vendor by phone number (public endpoint, no auth)
//       try {
//         const catRes = await axios.get(`${BACKEND_URL}/api/vendor/categories/public-categories-by-phone/${phone_number}`);
//         setCategories(catRes.data || []);
//       } catch (catErr) {
//         console.log('Categories not available, using empty array');
//         setCategories([]);
//       }
      
//       // Fetch working hours and open status if vendorId is available
//       const vendorId = res.data.vendorInfo?.vendor_id;
//       if (vendorId) {
//         try {
//           const whRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/working-hours`);
//           setWorkingHours(whRes.data || []);
//         } catch (whErr) {
//           console.log('Working hours not available');
//           setWorkingHours([]);
//         }
        
//         try {
//           const openRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/is-open`);
//           setIsOpen(openRes.data?.isOpen);
//         } catch (openErr) {
//           console.log('Open status not available');
//           setIsOpen(null);
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching vendor info:', err);
//       console.error('Error details:', {
//         message: err.message,
//         status: err.response?.status,
//         statusText: err.response?.statusText,
//         data: err.response?.data
//       });
      
//       // Clear the fallback timeout
//       clearTimeout(fallbackTimeout);
      
//       // Show more specific error message
//       const errorMessage = err.response?.status === 404 
//         ? 'Vendor not found' 
//         : err.response?.status === 500 
//         ? 'Server error - please try again' 
//         : 'Failed to load shop data';
        
//       // Don't show alert for 404, just show empty state
//       if (err.response?.status !== 404) {
//         Alert.alert('Error', errorMessage);
//       }
      
//       // Set fallback data for better UX
//       setVendorInfo({
//         shop_name: 'Vendor Not Found',
//         category: 'Unknown',
//         logo: null,
//         shop_front_photo: null
//       });
//       setProducts([]);
//       setFilteredProducts([]);
//       setCategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (phone_number) {
//       fetchVendorInfo();
//       setSelectedCategoryId('all');
//     }
//   }, [phone_number]);

//   useEffect(() => {
   
//     if (selectedCategoryId === 'all') {
//       setFilteredProducts(products);
//     } else {
//       setFilteredProducts(products.filter((p) => String(p.vendor_category_id) === String(selectedCategoryId)));
//     }
//   }, [selectedCategoryId]); 

//   // Filter products by selected category

//   // Debug logging
//   console.log('ShopDetails render - loading:', loading);
//   console.log('ShopDetails render - vendorInfo:', vendorInfo);
//   console.log('ShopDetails render - filteredProducts length:', filteredProducts?.length);
//   console.log('ShopDetails render - products length:', products?.length);

//   if (loading) {
//     return (
//       <View className="flex-1 bg-gray-50 justify-center items-center">
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text className="mt-4 text-gray-600">Loading shop details...</Text>
//       </View>
//     );
//   }

//   try {
//     return (
//     <View className="flex-1 bg-red-500">
//       <Text className="text-white text-xl font-bold p-4">TEST - CAN YOU SEE THIS?</Text>
//       <ScrollView>
//       {/* Debug Info */}
//       <View className="bg-yellow-100 p-4 m-4 rounded-lg">
//         <Text className="text-black font-bold">DEBUG INFO:</Text>
//         <Text className="text-black">Loading: {loading ? 'true' : 'false'}</Text>
//         <Text className="text-black">Vendor Name: {vendorInfo?.shop_name || 'No vendor name'}</Text>
//         <Text className="text-black">Products Count: {products?.length || 0}</Text>
//         <Text className="text-black">Filtered Products Count: {filteredProducts?.length || 0}</Text>
//         <Text className="text-black">Phone Number: {phone_number}</Text>
//       </View>

//       {/* Header with Hero Image */}
//       <View className="relative">
//         <Image
//           source={{ uri: vendorInfo?.shop_front_photo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
//           className="w-full h-48"
//           resizeMode="cover"
//         />
//         <View className="absolute inset-0 bg-black/20" />
//         <Pressable
//           onPress={() => router.back()}
//           className="absolute top-12 left-4 bg-white/90 p-2 rounded-full"
//         >
//           <Ionicons name="arrow-back" size={20} color="black" />
//         </Pressable>
//       </View>

//       {/* Shop Info Card */}
//       <View className="bg-white mx-4 -mt-8 rounded-2xl shadow-sm border border-gray-100">
//         <View className="p-4">
//           <View className="flex-row items-start">
//             <Image
//               source={{ uri: vendorInfo?.logo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
//               className="w-16 h-16 rounded-xl mr-4 border-2 border-gray-100"
//             />
//             <View className="flex-1">
//               <Text className="text-xl font-bold text-gray-900 mb-1">{vendorInfo?.shop_name || "Shop Name"}</Text>
//               <View className="flex-row items-center mb-2">
//                 <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
//                   <Ionicons name="star" size={14} color="#fbbf24" />
//                   <Text className="text-sm font-semibold text-gray-800 ml-1">{vendorInfo?.rating || "4.5"}</Text>
//                   <Text className="text-xs text-gray-500 ml-1">({vendorInfo?.ratingCount || 0})</Text>
//                 </View>
//                 <Pressable 
//                   onPress={() => {
//                     if (isOpen === false && workingHours.length > 0) {
//                       setShowWorkingHours(!showWorkingHours);
//                     }
//                   }}
//                   className={`ml-3 px-2 py-1 rounded-lg ${isOpen === null ? 'bg-gray-100' : isOpen ? 'bg-green-50' : 'bg-red-50'}`}
//                 >
//                   <View className="flex-row items-center">
//                     {isOpen === null && (
//                       <ActivityIndicator size="small" color="#6b7280" style={{ marginRight: 4 }} />
//                     )}
//                     <Text className={`text-xs font-semibold ${isOpen === null ? 'text-gray-500' : isOpen ? 'text-green-700' : 'text-red-700'}`}>
//                       {isOpen === null ? 'Checking...' : isOpen ? 'Open Now' : 'Closed'}
//                     </Text>
//                     {isOpen === false && workingHours.length > 0 && (
//                       <Ionicons name="chevron-down" size={12} color="#ef4444" style={{ marginLeft: 4 }} />
//                     )}
//                   </View>
//                 </Pressable>
//               </View>
//             </View>
//           </View>

//           {/* Working Hours Section */}
//           {showWorkingHours && workingHours.length > 0 && (
//             <View className="mt-3 pt-3 border-t border-gray-100">
//               <Text className="text-sm font-semibold text-gray-800 mb-2">Working Hours:</Text>
//               {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => {
//                 const intervals = workingHours.filter(h => h.day_of_week === i);
//                 return (
//                   <View key={day} className="flex-row items-center mb-1">
//                     <Text className="w-20 text-xs text-gray-600 font-medium">{day}:</Text>
//                     {intervals.length === 0 ? (
//                       <Text className="text-xs text-gray-400 ml-2">Closed</Text>
//                     ) : (
//                       intervals.map((intv, idx) => (
//                         <Text key={idx} className="text-xs text-gray-700 ml-2">
//                           {intv.open_time} - {intv.close_time}{idx < intervals.length - 1 ? ',' : ''}
//                         </Text>
//                       ))
//                     )}
//                   </View>
//                 );
//               })}
//             </View>
//           )}

//           {/* Delivery Info */}
//           <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
//             <View className="flex-row items-center">
//               <Ionicons name="time-outline" size={16} color="#6b7280" />
//               <Text className="text-sm text-gray-600 ml-2">{vendorInfo?.deliveryTime || '20-30 mins'}</Text>
//             </View>
//             <View className="flex-row items-center">
//               <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
//               <Text className="text-sm text-gray-600 ml-2">EGP {vendorInfo?.deliveryFee || 18.99}</Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* Category Tabs */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         className="mt-6 mb-4 px-4"
//         contentContainerStyle={{ paddingHorizontal: 4 }}
//       >
//                 <Pressable
//                   key="all"
//                   onPress={() => setSelectedCategoryId('all')}
//                   className={`mr-3 px-4 py-2 rounded-full ${selectedCategoryId === 'all' ? 'bg-primary' : 'bg-gray-100'}`}
//                 >
//                   <Text className={`text-sm font-medium ${selectedCategoryId === 'all' ? 'text-white' : 'text-gray-600'}`}>All</Text>
//                 </Pressable>
//         {categories.map((cat) => (
//           <Pressable
//             key={cat.id}
//             onPress={() => setSelectedCategoryId(cat.id)}
//             className={`mr-3 px-4 py-2 rounded-full ${String(selectedCategoryId) === String(cat.id) ? 'bg-primary' : 'bg-gray-100'}`}
//           >
//             <Text className={`text-sm font-medium ${String(selectedCategoryId) === String(cat.id) ? 'text-white' : 'text-gray-600'}`}>{cat.name}</Text>
//           </Pressable>
//         ))}
//       </ScrollView>

//       {/* Product Grid */}
//       <View className="px-4 mt-2">
//         <Text className="text-lg font-bold text-gray-900 mb-4">
//           {selectedCategoryId === 'all'
//             ? 'All Products'
//             : categories.find(cat => String(cat.id) === String(selectedCategoryId))?.name}
//         </Text>

//         {/* Simple Products Test */}
//         <View className="bg-blue-100 p-4 mb-4 rounded-lg">
//           <Text className="text-black font-bold">PRODUCTS TEST:</Text>
//           <Text className="text-black">Products array exists: {products ? 'YES' : 'NO'}</Text>
//           <Text className="text-black">Products length: {products?.length || 0}</Text>
//           <Text className="text-black">Filtered products length: {filteredProducts?.length || 0}</Text>
//         </View>

//         {filteredProducts?.length > 0 ? (
//           <View>
//             <Text className="text-black font-bold mb-4">PRODUCTS FOUND:</Text>
//             {filteredProducts.slice(0, 2).map((item, index) => (
//               <View key={item.id?.toString() || index} className="bg-white mb-4 p-4 rounded-lg border">
//                 <Text className="text-black font-bold">{item.name || 'No name'}</Text>
//                 <Text className="text-black">Price: EGP {item.price || 'No price'}</Text>
//                 <Text className="text-black">Stock: {item.stock || 'No stock'}</Text>
//                 <Pressable 
//                   onPress={() => addToCart(item)}
//                   className="bg-blue-500 p-2 rounded mt-2"
//                 >
//                   <Text className="text-white text-center">Add to Cart (Simple)</Text>
//                 </Pressable>
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View className="flex-1 items-center justify-center py-10">
//             <Ionicons name="cart-outline" size={48} color="#d1d5db" />
//             <Text className="mt-4 text-gray-400 font-semibold">No products available in this category.</Text>
//           </View>
//         )}
//       </View>
//       <View className="h-20" />
//     </ScrollView>
//     </View>
//     );
//   } catch (error) {
//     console.error('JSX Rendering Error:', error);
//     return (
//       <View className="flex-1 bg-red-500 justify-center items-center">
//         <Text className="text-white text-xl font-bold">JSX ERROR:</Text>
//         <Text className="text-white text-center mt-4">{error.message}</Text>
//       </View>
//     );
//   }
// }
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';

export default function ShopDetails() {
  const { phone_number } = useLocalSearchParams();
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState([]);
  const [isOpen, setIsOpen] = useState(null);
  const [showWorkingHours, setShowWorkingHours] = useState(false);

  const { addToCart } = useContext(CartContext);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchVendorInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phone_number}`, { timeout: 8000 });
      setVendorInfo(res.data.vendorInfo || {});
      const productsWithVendorId = (res.data.products || []).map(product => ({
        ...product,
        vendor_id: res.data.vendorInfo?.vendor_id || res.data.vendorInfo?.id
      }));
      setProducts(productsWithVendorId);
      setFilteredProducts(productsWithVendorId);

      // Fetch categories
      try {
        const catRes = await axios.get(`${BACKEND_URL}/api/vendor/categories/public-categories-by-phone/${phone_number}`);
        setCategories(catRes.data || []);
      } catch { setCategories([]); }

      // Working hours and open status
      const vendorId = res.data.vendorInfo?.vendor_id;
      if (vendorId) {
        try {
          const whRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/working-hours`);
          setWorkingHours(whRes.data || []);
        } catch { setWorkingHours([]); }

        try {
          const openRes = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/${vendorId}/is-open`);
          setIsOpen(openRes.data?.isOpen);
        } catch { setIsOpen(null); }
      }
    } catch (err) {
      console.error(err);
      setVendorInfo({ shop_name: 'Vendor Not Found', category: 'Unknown', logo: null, shop_front_photo: null });
      setProducts([]);
      setFilteredProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone_number) fetchVendorInfo();
  }, [phone_number]);

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => String(p.vendor_category_id) === String(selectedCategoryId)));
    }
  }, [selectedCategoryId, products]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Loading shop details...</Text>
      </View>
    );
  }

  return (
     <FlatList
       data={filteredProducts}
       keyExtractor={(item) => item.id.toString()}
       numColumns={2}
       contentContainerStyle={{ paddingBottom: 80 }}
       columnWrapperStyle={{ justifyContent: 'space-between' }}
      ListHeaderComponent={() => (
        <>
           {/* Header Hero Image */}
           <View className="relative">
             <Image
               source={{ uri: vendorInfo?.shop_front_photo || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
               className="w-full h-48"
               resizeMode="cover"
             />
             <View className="absolute inset-0 bg-black/20" />
             <Pressable onPress={() => router.back()} className="absolute top-12 left-4 bg-white/90 p-2 rounded-full">
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
              className={`mr-3 px-4 py-2 rounded-full ${selectedCategoryId === 'all' ? 'bg-primary' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm font-medium ${selectedCategoryId === 'all' ? 'text-white' : 'text-gray-600'}`}>All</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                className={`mr-3 px-4 py-2 rounded-full ${String(selectedCategoryId) === String(cat.id) ? 'bg-primary' : 'bg-gray-100'}`}
              >
                <Text className={`text-sm font-medium ${String(selectedCategoryId) === String(cat.id) ? 'text-white' : 'text-gray-600'}`}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Product Grid Header */}
          <View className="px-4 mt-2">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {selectedCategoryId === 'all'
                ? 'All Products'
                : categories.find(cat => String(cat.id) === String(selectedCategoryId))?.name}
            </Text>
          </View>
        </>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="w-[48%] bg-white mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100"
        >
          <View className="relative">
            <View className="w-full h-40 bg-gray-50 justify-center items-center">
              <Image
                source={{ uri: item?.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="absolute top-3 right-3 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
              <Text className="text-xs font-bold text-primary">EGP {parseFloat(item.price).toFixed(2)}</Text>
            </View>
            {item.stock > 0 && (
              <View className="absolute top-3 left-3 bg-primary px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">In Stock</Text>
              </View>
            )}
            {item.stock === 0 && (
              <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">Out of Stock</Text>
              </View>
            )}
          </View>
          <View className="p-4">
            <Text className="font-bold text-base text-gray-900 mb-2" numberOfLines={2}>{item.name}</Text>
            <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>{item.description || 'Fresh and delicious'}</Text>
            
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text className="text-sm text-gray-600 ml-1">4.5</Text>
                <Text className="text-xs text-gray-400 ml-1">•</Text>
                <Text className="text-xs text-gray-500 ml-1">{item.stock || 0} left</Text>
              </View>
            </View>
            
            <Pressable 
              className={`w-full py-3 rounded-xl ${item.stock > 0 ? 'bg-primary' : 'bg-gray-300'}`}
              disabled={item.stock === 0}
              onPress={() => addToCart(item)}
            >
              <Text className={`text-center font-semibold ${item.stock > 0 ? 'text-white' : 'text-gray-500'}`}>
                {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center py-10">
          <Ionicons name="cart-outline" size={48} color="#d1d5db" />
          <Text className="mt-4 text-gray-400 font-semibold">No products available in this category.</Text>
        </View>
      )}
    />
  );
}
