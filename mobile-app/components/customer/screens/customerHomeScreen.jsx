// import React, { useContext, useEffect  , useState} from 'react';
// import { ScrollView, View ,TextInput } from 'react-native';
// import CategorySlider from '../custom/CategorySlider';
// import DealsSection from '../custom/DealsSection';
// import LocationBanner from "../custom/LocationBanner";
// import ServiceSelector from '../custom/ServiceSelector';
// import SupportAccess from '../custom/SupportAccess';
// import VendorList from '../custom/VendorList';
// import WalletCard from '../custom/WalletCard';
// import OrderTrackingManager from '../custom/OrderTrackingManager';
// import CustomerTopNav from '../navigation/CustomerTopNav';
// import { useHome } from '../../../context/customer/HomeContext';
// import { useWallet } from '../../../context/customer/WalletContext';
// import { CustomerAuthContext } from '../../../context/customer/CustomerAuthContext';
// import { useLanguage } from '../../../context/LanguageContext';
// import HeroCarousel from '../custom/HeroCarousel';

// import { Ionicons ,FontAwesome} from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// export default function CustomerHomePage() {
//   const { isCustomerVerified } = useContext(CustomerAuthContext);
//   const { loadDataWhenAuthenticated } = useHome();
//   const { loadWalletWhenAuthenticated } = useWallet();
//   const { isRTL } = useLanguage();
//   const [search, setSearch] = useState('');

//   // Load data when user becomes authenticated
//   useEffect(() => {
//     if (isCustomerVerified) {
//       loadDataWhenAuthenticated();
//       loadWalletWhenAuthenticated();
//     }
//   }, [isCustomerVerified]);

//   const router = useRouter();

//   const handleInput = (text) => {
//     // Navigate to the shop screen and send the search text as a param
//     router.push({
//       pathname: "/customer/shop/shop",
//       params: { query: text },
//     });
//   };
//   return (
//     <View className="flex-1 bg-white" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
//       <CustomerTopNav />
//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        
//         <LocationBanner />
//         <View className="flex-row items-center mt-4 bg-gray-100 mx-8 rounded-full px-4 py-2 mb-6 shadow-sm">
//         <Ionicons name="search-outline" size={20} color="gray" />
//         <TextInput
//           placeholder="Search for products or stores"
//           value={search}
//           onChangeText={handleInput}
//           className="ml-2 flex-1 text-sm"
//         />
//       </View>
//         <HeroCarousel/>
//         {/* <WalletCard /> */}
//         <OrderTrackingManager />

//         <ServiceSelector />
        
//         <CategorySlider />
        

//         <VendorList />
        
        
        
        
//         <SupportAccess />
//         <View className="h-10" />
//       </ScrollView>
//     </View>
//   );
// }



import React, { useContext, useEffect  , useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  I18nManager, // For RTL support
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons'; // Expo's built-in icons
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind'; // For dark mode
import { useHome } from '../../../context/customer/HomeContext';
import { useWallet } from '../../../context/customer/WalletContext';
import { CustomerAuthContext } from '../../../context/customer/CustomerAuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HeroCarousel from '../custom/HeroCarousel';
import OrderTrackingManager from '../custom/OrderTrackingManager';

import { Ionicons ,FontAwesome} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';


const categories = [
  { name: 'food', icon: 'lunch-dining' },
  { name: 'groceries', icon: 'local-grocery-store' },
  { name: 'pharmacy', icon: 'local-pharmacy' },
  { name: 'stores', icon: 'shopping-bag' },
  { name: 'more', icon: 'more-horiz' },
];

const offers = [
  {
    title: '50% Off Your First Order',
    store: 'Healthy Life Restaurant',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsrBd4JUECgGOUJxgyMIqpUxpII50Bw-cJJo0qxLY3rOvn2KzRa1-GbTowjGibHZf0NsxkgB4Qa1z-PaTcXgndYHXCxl0Sg4rk4f2-hupAdo7uOqXux-OMnVCKuphTFoTKm-ekx-HsZFBhEj2v-SezfhGJk-2l0ETOM366Y4VcdAwqKEJ22DHoLmTY-oQKWZIstHLEj1vEirCroefTo0aeIqHmOwG7ALvI6vVvRQkmQTJEK6Hw_rRxIs5SnaUUvWFKJ6TUnMoHlAs',
  },
  {
    title: 'Buy One, Get One Free',
    store: "Barn's Cafe",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYjXHvNvVrPqTH_uabDFD6wOS-PRcD1X0pPH83MZqBFeKeAMvi9FnURGLcd4HW7YXV5_9jktG6lusKeu9VIwVXAVF3rBcW_D8zbJX3xBBwuvN9AYG7UaBePXkuShgkTzoLofoK46NlSAgakb6utoSCvhFOLpUpZrQkCk0xjALDjKkGrcGuyhz4b-Z6dHDHyRz3NMGMOc_kgjdpl4JJTzOa4zShsHCjus_KARnQPZKFbN2pj4PzWL8yqS0FRYX-PODdSTgOW_yGdZE',
  },
];



export default function CustomerHomePage() {
  const { isCustomerVerified } = useContext(CustomerAuthContext);
  const { loadDataWhenAuthenticated } = useHome();
  const { loadWalletWhenAuthenticated } = useWallet();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const { colorScheme } = useColorScheme();
  const [location, setLocation] = useState('');


  // Load data when user becomes authenticated
  useEffect(() => {
    if (isCustomerVerified) {
      loadDataWhenAuthenticated();
      loadWalletWhenAuthenticated();
    }
  }, [isCustomerVerified]);

  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
      if (reverseGeocode?.[0]) {
        const { street, name, city } = reverseGeocode[0];
        setLocation(`${name || ''} , ${city || ''} ` );
      }
    })();
  }, []);

  const handleInput = (text) => {
    // Navigate to the shop screen and send the search text as a param
    router.push({
      pathname: "/customer/shop/shop",
      params: { query: text },
    });
  };
  return (
    <View 
    className="flex-1 bg-background-light dark:bg-background-dark"
  >
    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    
    {/* 1. The Header (Sticky Top) */}
    <AppHeader location = {location}/>

    {/* 2. The Body (Scrollable) */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      // This paddingBottom prevents the content from being hidden
      // by the fixed BottomNav (h-20 + bottom safe area)
      contentContainerStyle={{ paddingBottom: 100 }} 
    >
      <OrderTrackingManager />
      <CategoryIcons />
      <ServiceButtons />
      <StoreList />
      <PromoBanners />
      <OffersList />
    </ScrollView>

    {/* 3. The Navigation (Fixed Bottom) */}
  </View>
  );
}



function AppHeader({location}) {
  // useSafeAreaInsets gets the height of the status bar
  const router = useRouter();
  const handleInput = (text) => {
    // Navigate to the shop screen and send the search text as a param
    router.push({
      pathname: "/customer/shop/shop",
      params: { query: text },
    });
  };
  return (
    // We add the status bar height as top padding
    <View  className="bg-primary pt-7 "  >
      <View className="p-4">
        {/* Location Section */}
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="location-on" size={24} color="white" />
          <View>
            <Text className="text-white text-base font-bold">Address</Text>
            <Text className="text-gray-200 dark:text-gray-300 text-sm">{location}</Text>
          </View>
        </View>

        {/* Search Bar Section */}
        <View className="relative mt-4">
          <TextInput
            className="bg-white dark:bg-gray-100 border-none rounded-lg py-3 pr-10 pl-4 w-full text-gray-800 dark:text-gray-900 text-sm shadow-sm"
            style={{ fontFamily: 'Cairo-Regular', textAlign: I18nManager.isRTL ? 'right' : 'left' }}
            placeholder="Search"
            placeholderTextColor="#6B7280"
            onChangeText={handleInput}
          />
          <MaterialIcons name="search" size={24} color="#6B7280" className="absolute right-3 top-3" />
        </View>
      </View>
    </View>
  );
}

// function CategoryIcons() {
//   return (
//     <View className="px-4 pt-6">
//       <Text className="text-[#333333] dark:text-white text-lg font-bold mb-3" style={{fontFamily: 'Cairo-Bold'}}>أصناف المتاجر</Text>
//       {/* This was justify-around on web, so we use flex-row */}
//       <View className="flex-row justify-around w-full">
//         {categories.map((category) => (
//           <TouchableOpacity key={category.name} className="flex-col items-center justify-center gap-2 text-center">
//             <View className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
//               <MaterialIcons name={category.icon} size={32} color="#4CAF50" />
//             </View>
//             <Text className="text-[#333333] dark:text-white text-sm font-medium" style={{fontFamily: 'Cairo-Medium'}}>{category.name}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// }
function CategoryIcons() {
  const router = useRouter(); 

  const handleCategoryPress = (category) => {
    // 3. Navigate to the shop screen
    router.push({
      pathname: '/customer/shop/shop', // The path to your shop screen
      params: {
        categoryName: category.name, // Pass the category name as a param
      },
    });
  };

  return (
    <View className="px-4 pt-6">
      <Text className="text-[#333333] dark:text-white text-lg font-bold mb-3">Categories</Text>
      <View className="flex-row justify-around w-full">
        {categories.map((category) => (
          // 4. Call the handler on press
          <TouchableOpacity
            key={category.name}
            className="flex-col items-center justify-center gap-2 text-center"
            onPress={() => handleCategoryPress(category)} // <--- Added onPress
          >
            <View className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
              <MaterialIcons name={category.icon} size={32} color="#4CAF50" />
            </View>
            <Text className="text-[#333333] dark:text-white text-sm font-medium">{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ServiceButtons() {
  return (
    <View className="flex-row gap-4 px-4 pt-6">
      <TouchableOpacity className="flex-1 flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-32">
        <MaterialIcons name="inventory-2" size={48} color="#4CAF50" />
        <Text className="text-[#333333] dark:text-white text-base font-bold">Package Delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-32">
        <MaterialIcons name="directions-car" size={48} color="#4CAF50" />
        <Text className="text-[#333333] dark:text-white text-base font-bold">Ride Hailing</Text>
      </TouchableOpacity>
    </View>
  );
}

function StoreList() {
  const { vendors, loading, error } = useHome();
  const { t } = useLanguage();
  const router = useRouter(); 



  const handleVendorPress = (vendor) => {
    // Navigate to vendor shop page
    router.push(`/customer/shopDetails/${vendor.phone_number}`);
  };

  const getVendorImage = (vendor) => {
    // Use vendor logo if available, otherwise use default
    if (vendor.logo) {
      return { uri: vendor.logo };
    }
    return require('../../../assets/images/Elnaizak-logo.jpeg');
  };

  return (
    <View className="pt-5">
      <Text className="text-[#333333] dark:text-white text-lg font-bold px-4 pb-3 mb-4" style={{fontFamily: 'Cairo-Bold'}}>Most Popular Stores</Text>
      {/* This was overflow-x-auto, now it's ScrollView horizontal */}
      <ScrollView
        className="mt-4"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }} // Use gap for spacing
      >
        {vendors.slice(0, 5).map((store) => (
          // We must set a width, w-72 is approx 280px
          <TouchableOpacity onPress={() => handleVendorPress(store)} key={store.shop_name} className="w-72 shadow-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            {/* This was a background-image div, now it's ImageBackground */}
            <ImageBackground
              source={getVendorImage(store)}
              className="w-full aspect-video" // aspect-video works in NativeWind!
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="text-[#333333] dark:text-white text-base font-bold" style={{fontFamily: 'Cairo-Bold'}}>{store.shop_name}</Text>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="star" size={16} color="#FACC15" />
                <Text className="text-gray-500 dark:text-gray-400 text-sm">3.6</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function PromoBanners() {
  return (
    // Use gap-4 to space the banners vertically
    // The p-4 provides the "full-width" feel with screen padding
    <View className="p-4 gap-4">
      {/* Points Banner */}
      <View className="flex-col items-stretch justify-start rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <View className="flex-row w-full items-center justify-between p-4">
          <View className="gap-1">
            {/* CORRECTED: English text and removed font style */}
            <Text className="text-primary text-lg font-bold">Use & Save</Text>
            <Text className="text-[#333333] dark:text-white text-base">You have 500 points</Text>
          </View>
          <TouchableOpacity className="items-center justify-center rounded-lg h-10 px-4 bg-primary">
            {/* CORRECTED: English text and removed font style */}
            <Text className="text-white text-sm font-bold">View Points</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pro Banner */}
      <View className="flex-row items-stretch justify-between rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <View className="flex-col items-start justify-center gap-2 p-4 flex-1">
          {/* CORRECTED: English text and removed font style */}
          <Text className="text-primary text-lg font-bold">App Pro Subscription</Text>
          <Text className="text-[#333333] dark:text-white text-base">Unlimited free delivery!</Text>
          <TouchableOpacity className="items-center justify-center rounded-lg h-10 px-4 bg-primary mt-2">
            {/* CORRECTED: English text and removed font style */}
            <Text className="text-white text-sm font-bold">Subscribe Now</Text>
          </TouchableOpacity>
        </View>
        <ImageBackground
          source={{ uri:	"https://lh3.googleusercontent.com/aida-public/AB6AXuCQvcIUAI0DNmoyrl5ziagZdf_V5G0SLQhmFKrFNs7qcF9ZmJnOzlgHtLp1OkiXqh9SFXuwx8CxOtAlhv2I_nBDbalMCIxmZLyprxZit6OhFeDYo_dLxO9OVVPiH6y7fNx1pVBPf_5HRSdqt99R_HL9oVzfiN6M50ftZbE1jzEQSSt2tqKfFl8BhQSbiRYoSH9ilmi2XZRrEjq6-kL8A_jVO7OC9brud1cJOSEZG0nrQ_JA-B4vlvzxzZMuU8KC68XS5K5-GLuO4bI" }}
          className="w-1/3"
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

function OffersList() {
  return (
    <View className="pt-5 ">
      {/* CORRECTED: English text and removed font style */}
      <Text className="text-[#333333] dark:text-white text-lg font-bold px-4 pb-3">Saving Offers</Text>
      {/* This was grid-cols-1, so we just use gap-4 */}
      <View className="px-4 gap-4">
        {offers.map((offer) => (
          <TouchableOpacity key={offer.title} className="flex-col gap-2 rounded-xl shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
            <ImageBackground
              source={{ uri: offer.image }}
              className="w-full aspect-video"
              resizeMode="cover"
            />
            <View className="p-3 pt-0">
              {/* CORRECTED: Removed font style. Text comes from 'offers' array. */}
              <Text className="text-[#333333] dark:text-white text-base font-bold">{offer.title}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">{offer.store}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}