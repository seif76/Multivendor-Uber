
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import Constants from 'expo-constants';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     FlatList,
//     Image,
//     Pressable,
//     ScrollView,
//     Text,
//     TextInput,
//     View,
// } from 'react-native';

// const categories = [
//   { id: 'all', name: 'All', icon: '🛍️' },
//   { id: 'sweets', name: 'Sweets', icon: '🍬' },
//   { id: 'pets', name: 'Pets', icon: '🐶' },
//   { id: 'party', name: 'Party', icon: '🎉' },
//   { id: 'tech', name: 'Tech', icon: '💻' },
// ];

// const filters = ['Offers', 'Free delivery', 'Under 30 mins'];

// export default function CustomerShopScreen() {
//   const [search, setSearch] = useState('');
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation();
//   const router = useRouter();
//   const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   const fetchVendors = async () => {
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/vendor/all`); // Replace with real IP
//       setVendors(res.data.vendors || []);
//     } catch (err) {
//       console.error('Error fetching vendors:', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredVendors = vendors.filter((vendor) =>
//     vendor?.vendor_info?.shop_name
//       ?.toLowerCase()
//       .includes(search.toLowerCase())
//   );

//   return (
//     <View className="flex-1 bg-white px-4 pt-12">
//       <Pressable onPress={() => router.push('/customer/home')} className="absolute mt-2 ml-4 mb-4 w-10 z-10">
//         <Ionicons name="arrow-back" size={24} color="black" />
//       </Pressable>

//       <View className="flex-row items-center justify-between mb-4">
//         <Text className="text-gray-700 font-semibold">
//           Deliver to <Text className="text-black">Mokhtar Abd El-Raheem</Text>
//         </Text>
//         <Ionicons name="cart-outline" size={24} color="black" />
//       </View>

//       <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
//         <Ionicons name="search-outline" size={20} color="gray" />
//         <TextInput
//           placeholder="Search for products or stores"
//           value={search}
//           onChangeText={setSearch}
//           className="ml-2 flex-1 text-sm"
//         />
//       </View>

//       <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
//         {categories.map((cat) => (
//           <View key={cat.id} className="items-center mr-6">
//             <Text className="text-2xl">{cat.icon}</Text>
//             <Text className="text-md mb-5 mt-1 text-primary">{cat.name}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       <View className=" mb-5">
//         <View className="flex-row flex-wrap">
//           {filters.map((filter, index) => (
//             <Pressable
//               key={index}
//               className="border border-primary rounded-full px-3 py-1 mr-2 mb-2"
//             >
//               <Text className="text-primary text-sm">{filter}</Text>
//             </Pressable>
//           ))}
//         </View>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#00b894" className="mt-10" />
//       ) : (
//         <FlatList
//           data={filteredVendors}
//           keyExtractor={(item) => item.id.toString()}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 50 }}
//           renderItem={({ item }) => (
//             <Pressable
//               className="bg-white rounded-xl shadow-md mb-5"
//               onPress={() =>
//                 navigation.navigate('VendorDetails', { vendorId: item.id })
//               }
//             >
//               <Image
//               source={{ uri: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
//                 // source={{
//                 //   uri:
//                 //     item.vendor_info?.shop_front_photo
//                 //       ? `http://<your-local-ip>:5000/uploads/${item.vendor_info.shop_front_photo}`
//                 //       : 'https://via.placeholder.com/150',
//                 // }}
//                 className="w-full h-44 rounded-t-xl"
//                 resizeMode="cover"
//               />
//               <View className="p-3">
//                 <Text className="font-bold text-lg mb-1">
//                   {item.vendor_info?.shop_name || 'Unnamed Shop'}
//                 </Text>
//                 <Text className="text-sm text-gray-500 mb-1">
//                   {item.vendor_info?.shop_location || 'No location'}
//                 </Text>
//                 <Pressable
//                   onPress={() => router.push(`/customer/shopDetails/${item.vendor_info.phone_number}`)} 
//                   className="mt-3 bg-primary py-2 rounded-lg items-center">
//                   <Text className="text-white font-semibold text-sm">
//                     View Shop
//                   </Text>
//                 </Pressable>
//               </View>
//             </Pressable>
//           )}
//         />
//       )}
//     </View>
//   );
// }





import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import VendorCard from '../multiShopPage/VendorCard';
import ShopHeader from '../multiShopPage/header';

const categories = [
  { id: 'all', name: 'All', icon: '🛍️' },
  { id: 'sweets', name: 'Sweets', icon: '🍬' },
  { id: 'pets', name: 'Pets', icon: '🐶' },
  { id: 'party', name: 'Party', icon: '🎉' },
  { id: 'tech', name: 'Tech', icon: '💻' },
];

const filters = ['Offers', 'Free delivery', 'Under 30 mins'];

export default function CustomerShopScreen() {
  const [search, setSearch] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/vendor/all`);
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor?.vendor_info?.shop_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <View className="bg-white px-4 pt-14 min-h-screen">
      {/* Back button */}
      <Pressable onPress={() => router.push('/customer/home')} className="absolute mt-2 ml-4 mb-4 w-10 z-10">
         <Ionicons name="arrow-back" size={24} color="black" />
       </Pressable>

      {/* Header */}
      <ShopHeader/>

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
 horizontal
 showsHorizontalScrollIndicator={false}
 className="mb-4"
 style={{ maxHeight: 70 }}
 contentContainerStyle={{ paddingHorizontal: 4 }}
>
  {categories.map((cat) => (
    <View key={cat.id} className="items-center mr-4">
      <Text className="text-2xl">{cat.icon}</Text>
      <Text className="text-sm mt-1 text-primary">{cat.name}</Text>
    </View>
  ))}
</ScrollView>


{/* Filters */}
<View className="flex-row flex-wrap mb-4">
  {filters.map((filter, index) => (
    <Pressable
      key={index}
      className="bg-green-100 border border-primary rounded-full px-4 py-1 mr-2 mb-2"
    >
      <Text className="text-primary text-sm font-medium">{filter}</Text>
    </Pressable>
  ))}
</View>


      {/* Vendors */}
      {loading ? (
  <ActivityIndicator size="large" color="#007233" className="mt-10" />
) : (
  <>
    {filteredVendors.length === 0 ? (
      <View className="  flex-1 -mt-60 items-center justify-center">
        <Text className="text-gray-500 text-base">No vendors found.</Text>
      </View>
    ) : (
      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => <VendorCard vendor={item} />}
      />
    )}
  </>
)}

    </View>
  );
}



