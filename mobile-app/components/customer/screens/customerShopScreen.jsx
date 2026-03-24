import { Ionicons ,FontAwesome} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // Expo's built-in icons
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState , useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import VendorCard from '../multiShopPage/VendorCard';
import ShopHeader from '../multiShopPage/header';
import { useLocalSearchParams } from "expo-router";

 // const filters = ['Offers', 'Free delivery', 'Under 30 mins'];

// export default function CustomerShopScreen() {
//   const { query , categoryName } = useLocalSearchParams(); // get the query text
//   const [search, setSearch] = useState(query || ''); // keep it as initial search
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation();
//   const router = useRouter();
//   const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

//   const [activeCategory, setActiveCategory] = useState(categoryName == "more"?"All" :categoryName  || "All");

//   // Default categories as fallback
//   const defaultCategories = [
//     { id: 'Food', label: 'Food', icon: 'lunch-dining', iconType: 'Ionicons' },
//     { id: 'Grocery', label: 'Grocery', icon: 'local-grocery-store', iconType: 'MaterialIcons' }, // Assuming you'd use MaterialIcons
//     { id: 'Pharmacy', label: 'Pharmacy', icon: 'local-pharmacy', iconType: 'MaterialIcons' },
//     { id: 'Stores', label: 'Stores', icon: 'shopping-bag', iconType: 'MaterialIcons' },
//     { id: 'More', label: 'All', icon: 'more-horiz', iconType: 'MaterialIcons' },
//   ]; 

//   const handleCategoryPress = (category) => {
//     // Navigate to shop with category filter
//     setActiveCategory(category.label);
//     alert("coming soon");
//   };

//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   const fetchVendors = async () => {
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/vendor/all`);
//       setVendors(res.data.vendors || []);
//     } catch (err) {
//       console.error('Error fetching vendors:', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredVendors = vendors.filter((vendor) => {
//     // Category check
//     const categoryMatch =
//       activeCategory === 'All' ||
//       vendor.vendor_info?.category?.toLowerCase() === activeCategory.toLowerCase();

//     // Search text check
//     const searchMatch =
//       !search || // if search is empty, all match
//       vendor.vendor_info?.shop_name
//         ?.toLowerCase()
//         .includes(search.toLowerCase());

//     return categoryMatch && searchMatch;
//   });

//   return (
//     <View className="bg-white px-4 pt-14 min-h-screen">
//       {/* Back button */}
//       <Pressable onPress={() => router.push('/customer/home')} className="absolute mt-2 ml-4 mb-4 w-10 z-10">
//          <Ionicons name="arrow-back" size={24} color="black" />
//        </Pressable>

//       {/* Header */}
//       <ShopHeader/>

//       {/* Search */}
//       <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-6 shadow-sm">
//         <Ionicons name="search-outline" size={20} color="gray" />
//         <TextInput
//           placeholder="Search for products or stores"
//           value={search}
//           onChangeText={setSearch}
//           className="ml-2 flex-1 text-sm"
//         />
//       </View>

//       {/* Categories */}


//       <ScrollView 
//         style={{ height: 45, maxHeight: 45 }} 
//         horizontal 
//         showsHorizontalScrollIndicator={false} 
//         className="space-x-4  mb-6">

//         {defaultCategories.map((category, i) => 
//         {
//           const isActive = activeCategory === category.label;
//           return(
          
//           <Pressable
//           key={category.id}
//           onPress={() => handleCategoryPress(category)}
//           className={`flex-row items-center px-4 py-2 rounded-full mr-3  ${
//             isActive ? "bg-green-100" : "bg-gray-100"
//           }`}
//         >
//           <View
//             className={`rounded-full p-2 mb-1 ${
//               isActive ? "bg-green-500" : "bg-white"
//             }`}
//           >
//              <MaterialIcons
//                 name={category.icon}
//                 size={15}
//                 color={isActive ? "white" : "#007233"}
//               />
//             {/* {category.iconType === "Ionicons" ? (
//               <Ionicons
//                 name={category.icon}
//                 size={15}
//                 color={isActive ? "white" : "#007233"}
//               />
//             ) : (
//               <MaterialIcons
//                 name={category.icon}
//                 size={15}
//                 color={isActive ? "white" : "#007233"}
//               />
//             )} */}
//           </View>

//           <Text
//             className={`text-xs ml-2 ${
//               isActive ? "text-green-700 font-semibold" : "text-gray-600"
//             }`}
//             numberOfLines={1}
//           >
//             {category.label}
//           </Text>
//         </Pressable>
//         )
//           }
//           )
          
//       }
//       </ScrollView>


//           {/* Filters */}
//           <View className="flex-row flex-wrap mb-4">
//             {filters.map((filter, index) => (
//               <Pressable
//                 key={index}
//                 className="bg-green-100 border border-primary rounded-full px-4 py-1 mr-2 mb-2"
//               >
//                 <Text className="text-primary text-sm font-medium">{filter}</Text>
//               </Pressable>
//             ))}
//           </View>


//       {/* Vendors */}
//        {loading ? (
//         <ActivityIndicator size="large" color="#007233" className="mt-10" />
//       ) : (
//         <View className="flex-1">
//           {filteredVendors.length === 0 ? (
//             <View className="  mt-40 items-center justify-center">
//               <Text className="text-gray-950 text-base">No vendors found.</Text>
//             </View>
//           ) : (
          
  

//             <FlatList
//               data={filteredVendors}
//               keyExtractor={(item) => item.id.toString()}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 80 }}
//               renderItem={({ item }) => <VendorCard vendor={item} />}
//               horizontal={false}
//             />
          
//           )}
//         </View>
//       )}

//           </View>
//         );
//       }





export default function CustomerShopScreen() {
  const { query, categoryName } = useLocalSearchParams();
  const [search, setSearch] = useState(query || '');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const [activeCategory, setActiveCategory] = useState(categoryName === "more" ? "All" : categoryName || "All");

  const defaultCategories = [
    { id: 'Food', label: 'Food', icon: 'lunch-dining' },
    { id: 'Grocery', label: 'Grocery', icon: 'local-grocery-store' },
    { id: 'Pharmacy', label: 'Pharmacy', icon: 'local-pharmacy' },
    { id: 'Stores', label: 'Stores', icon: 'shopping-bag' },
    { id: 'More', label: 'All', icon: 'more-horiz' },
  ];

  const handleCategoryPress = (category) => {
    setActiveCategory(category.label);
  //  alert("coming soon");
  };

  useEffect(() => {
    fetchVendors(1, true);
  }, []);

  const fetchVendors = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
  
    try {
      const res = await axios.get(`${BACKEND_URL}/api/vendor/allActive`, {
        params: { page: pageNum, limit: 10 },
      });
      const newVendors = res.data.vendors || [];
      setVendors(reset ? newVendors : (prev) => [...prev, ...newVendors]);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching vendors:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [BACKEND_URL]);

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetchVendors(page + 1);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const categoryMatch =
      activeCategory === 'All' ||
      vendor.vendor_info?.category?.toLowerCase() === activeCategory.toLowerCase();
    const searchMatch =
      !search ||
      vendor.vendor_info?.shop_name?.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <View className="bg-white px-4 pt-14 min-h-screen">
      {/* Back button */}
      <Pressable onPress={() => router.push('/customer/home')} className="absolute mt-2 ml-4 mb-4 w-10 z-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      {/* Header */}
      <ShopHeader />

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-6 shadow-sm">
        <Ionicons name="search-outline" size={20} color="gray" />
        <TextInput
          placeholder="Search for products or stores"
          value={search}
          onChangeText={setSearch}
          className="ml-2 flex-1 text-sm"
        />
      </View>

      {/* Categories */}
      <ScrollView
        style={{ height: 45, maxHeight: 45 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="space-x-4 mb-6"
      >
        {defaultCategories.map((category) => {
          const isActive = activeCategory === category.label;
          return (
            <Pressable
              key={category.id}
              onPress={() => handleCategoryPress(category)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${isActive ? "bg-green-100" : "bg-gray-100"}`}
            >
              <View className={`rounded-full p-2 mb-1 ${isActive ? "bg-green-500" : "bg-white"}`}>
                <MaterialIcons name={category.icon} size={15} color={isActive ? "white" : "#007233"} />
              </View>
              <Text className={`text-xs ml-2 ${isActive ? "text-green-700 font-semibold" : "text-gray-600"}`} numberOfLines={1}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Filters */}
      {/* <View className="flex-row flex-wrap mb-4">
        {filters.map((filter, index) => (
          <Pressable key={index} className="bg-green-100 border border-primary rounded-full px-4 py-1 mr-2 mb-2">
            <Text className="text-primary text-sm font-medium">{filter}</Text>
          </Pressable>
        ))}
      </View> */}

      {/* Vendors */}
      {loading ? (
        <ActivityIndicator size="large" color="#007233" className="mt-10" />
      ) : (
        <View className="flex-1">
          {filteredVendors.length === 0 ? (
            <View className="mt-40 items-center justify-center">
              <Text className="text-gray-950 text-base">No vendors found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVendors}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={({ item }) => <VendorCard vendor={item} />}
              onEndReached={handleLoadMore}        // ← load more on scroll end
              onEndReachedThreshold={0.3}          // ← trigger when 30% from bottom
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator size="small" color="#007233" className="py-4" />
                ) : page >= totalPages ? (
                  <Text className="text-center text-gray-400 text-xs py-4">No more vendors</Text>
                ) : null
              }
            />
          )}
        </View>
      )}
    </View>
  );
}
