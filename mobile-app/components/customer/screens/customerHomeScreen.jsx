// Updated CustomerHomePage.js
// - Added SafeAreaView for proper notch handling
// - Locked colors so they don't change in dark mode
// - Kept all commented sections intact

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  I18nManager
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useHome } from '../../../context/customer/HomeContext';
import { useWallet } from '../../../context/customer/WalletContext';
import { CustomerAuthContext } from '../../../context/customer/CustomerAuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import OrderTrackingManager from '../custom/OrderTrackingManager';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

//import React, { useContext, useEffect, useState } from 'react';


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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsrBd4JUECgGOUJxgyMIqpUxpII50Bw-cJJo0qxLY3rOvn2KzRa1-GbTowjGibHZf0NsxkgB4Qa1z-PaTcXgndYHXCxl0Sg4rk4f2-hupAdo7uOqXux-OMnVCKuphTFoTKm-ekx-HsZFBhEj2v-SezfhGJk-2l0ETOM366Y4VcdAwqKEJ22DHoLmTY-oQKWZIstHLEj1vEirCroefTo0aeIqHmOwG7ALvI6vVvRQkmQTJEK6Hw_rRxIs5SnaUUvWFKJ6TUnMoHlAs',
  },
  {
    title: 'Buy One, Get One Free',
    store: "Barn's Cafe",
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYjXHvNvVrPqTH_uabDFD6wOS-PRcD1X0pPH83MZqBFeKeAMvi9FnURGLcd4HW7YXV5_9jktG6lusKeu9VIwVXAVF3rBcW_D8zbJX3xBBwuvN9AYG7UaBePXkuShgkTzoLofoK46NlSAgakb6utoSCvhFOLpUpZrQkCk0xjALDjKkGrcGuyhz4b-Z6dHDHyRz3NMGMOc_kgjdpl4JJTzOa4zShsHCjus_KARnQPZKFbN2pj4PzWL8yqS0FRYX-PODdSTgOW_yGdZE',
  },
];

export default function CustomerHomePage() {
  const { isCustomerVerified } = useContext(CustomerAuthContext);
  const { loadDataWhenAuthenticated } = useHome();
  const { loadWalletWhenAuthenticated } = useWallet();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const { colorScheme } = useColorScheme(); // but we will NOT use it for colors

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

      const loc = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync(loc.coords);
      if (reverse?.[0]) {
        const { name, city } = reverse[0];
        setLocation(`${name || ''}, ${city || ''}`);
      }
    })();
  }, []);

  return (
  <SafeAreaView
    edges={['left', 'right']}
    style={{ flex: 1, backgroundColor: '#FFFFFF' }}
  >
    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AppHeader location={location} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <OrderTrackingManager />
        <CategoryIcons />
        <ServiceButtons />
        <StoreList />
        <PromoBanners />
        <OffersList />
      </ScrollView>
    </View>
  </SafeAreaView>
);

}

function AppHeader({ location }) {
  const router = useRouter();

  const handleInput = (text) => {
    router.push({ pathname: '/customer/shop/shop', params: { query: text } });
  };

  return (
    <View style={{ backgroundColor: '#4CAF50', paddingTop: 0 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="location-on" size={24} color="#FFFFFF" />
          <View>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Address</Text>
            <Text style={{ color: '#EEEEEE', fontSize: 14 }}>{location}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16, position: 'relative' }}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#6B7280"
            onChangeText={handleInput}
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              color: '#000',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
          />
          <MaterialIcons
            name="search"
            size={24}
            color="#6B7280"
            style={{ position: 'absolute', right: 10, top: 12 }}
          />
        </View>
      </View>
    </View>
  );
}

function CategoryIcons() {
  const router = useRouter();

  const handleCategoryPress = (category) => {
    router.push({ pathname: '/customer/shop/shop', params: { categoryName: category.name } });
  };

  return (
    // <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
    //   <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Categories</Text>
    //   <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
    //     {categories.map((category) => (
    //       <TouchableOpacity key={category.name} onPress={() => handleCategoryPress(category)}>
    //         <View style={{ width: 64, height: 64, backgroundColor: 'grey', borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 2 }}>
    //           <MaterialIcons name={category.icon} size={32} color="#4CAF50" />
    //         </View>
    //         <Text style={{ textAlign: 'center', marginTop: 6, color: '#333' }}>{category.name}</Text>
    //       </TouchableOpacity>
    //     ))}
    //   </View>
    // </View>

   <View className="pt-6">
  <Text className="px-4 mb-3 text-lg font-bold text-[#333]">
    Categories
  </Text>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="px-4 gap-4"
  >
    {categories.map((category) => (
      <TouchableOpacity
        key={category.name}
        onPress={() => handleCategoryPress(category)}
        className="items-center"
        activeOpacity={0.8}
      >
        {/* Icon Circle */}
        <View className="aspect-square h-16 rounded-full bg-stone-50 items-center justify-center shadow-sm">
          <MaterialIcons
            name={category.icon}
            size={28}
            color="#4CAF50"
          />
        </View>

        {/* Label */}
        <Text className="mt-2 text-xs text-center text-[#333]">
          {category.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>


  );
}

function ServiceButtons() {
  return (
    <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingTop: 24 }}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center',justifyContent:'center', elevation: 2 }}>
        <MaterialIcons name="inventory-2" size={44} color="#4CAF50" className='pb-2' />
        <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold'  }}>Package Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 }}>
        <MaterialIcons name="directions-car" size={44} color="#4CAF50" className='pb-2' />
        <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold' }}>Ride Hailing</Text>
      </TouchableOpacity>
    </View>
  );
}

function StoreList() {
  const { vendors } = useHome();
  const router = useRouter();

  const handleVendorPress = (vendor) => {
    router.push(`/customer/shopDetails/${vendor.phone_number}`);
  };

  const getVendorImage = (vendor) => {
    if (vendor.logo) return { uri: vendor.logo };
    return require('../../../assets/images/Elnaizak-logo.jpeg');
  };

  return (
    <View style={{ paddingTop: 20,paddingBottom: 20 }}>
      <Text  style={{ paddingHorizontal: 16, fontSize: 18, fontWeight: 'bold', color: '#333', paddingBottom: 20 }}>
        Most Popular Stores
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 ,paddingBottom: 1  }}>
        {vendors.slice(0, 5).map((store) => (
          <TouchableOpacity key={store.shop_name} onPress={() => handleVendorPress(store)} style={{ width: 280, backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
            <ImageBackground source={getVendorImage(store)} style={{ width: '100%', aspectRatio: 16 / 9 }} resizeMode="cover" />

            <View style={{ padding: 12 }}>
              <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>{store.shop_name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialIcons name="star" size={16} color="#FACC15" />
                <Text style={{ color: '#555' }}>3.6</Text>
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
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ backgroundColor: '#F8F8F8', borderRadius: 12, padding: 16, elevation: 2 }}>
        <Text style={{ color: '#4CAF50', fontSize: 18, fontWeight: 'bold' }}>Use & Save</Text>
        <Text style={{ color: '#333', marginTop: 4 }}>You have 500 points</Text>
        <TouchableOpacity style={{ backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>View Points</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#F8F8F8', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: '#4CAF50', fontSize: 18, fontWeight: 'bold' }}>App Pro Subscription</Text>
          <Text style={{ color: '#333', marginTop: 4 }}>Unlimited free delivery!</Text>
          <TouchableOpacity style={{ backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 12 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQvcIUAI0DNmoyrl5ziagZdf_V5G0SLQhmFKrFNs7qcF9ZmJnOzlgHtLp1OkiXqh9SFXuwx8CxOtAlhv2I_nBDbalMCIxmZLyprxZit6OhFeDYo_dLxO9OVVPiH6y7fNx1pVBPf_5HRSdqt99R_HL9oVzfiN6M50ftZbE1jzEQSSt2tqKfFl8BhQSbiRYoSH9ilmi2XZRrEjq6-kL8A_jVO7OC9brud1cJOSEZG0nrQ_JA-B4vlvzxzZMuU8KC68XS5K5-GLuO4bI" }}
          className="w-1/3" resizeMode="cover"
        />
      </View>
    </View>
  );
}

function OffersList() {
  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ paddingHorizontal: 16, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
        Saving Offers
      </Text>

      <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 12 }}>
        {offers.map((offer) => (
          <TouchableOpacity key={offer.title} style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
            <ImageBackground source={{ uri: offer.image }} style={{ width: '100%', aspectRatio: 4 / 2 }} resizeMode="cover" />

            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{offer.title}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>{offer.store}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
  