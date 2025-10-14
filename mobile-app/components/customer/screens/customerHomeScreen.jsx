import React, { useContext, useEffect  , useState} from 'react';
import { ScrollView, View ,TextInput } from 'react-native';
import CategorySlider from '../custom/CategorySlider';
import DealsSection from '../custom/DealsSection';
import LocationBanner from "../custom/LocationBanner";
import ServiceSelector from '../custom/ServiceSelector';
import SupportAccess from '../custom/SupportAccess';
import VendorList from '../custom/VendorList';
import WalletCard from '../custom/WalletCard';
import OrderTrackingManager from '../custom/OrderTrackingManager';
import CustomerTopNav from '../navigation/CustomerTopNav';
import { useHome } from '../../../context/customer/HomeContext';
import { useWallet } from '../../../context/customer/WalletContext';
import { CustomerAuthContext } from '../../../context/customer/CustomerAuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HeroCarousel from '../custom/HeroCarousel';

import { Ionicons ,FontAwesome} from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CustomerHomePage() {
  const { isCustomerVerified } = useContext(CustomerAuthContext);
  const { loadDataWhenAuthenticated } = useHome();
  const { loadWalletWhenAuthenticated } = useWallet();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');

  // Load data when user becomes authenticated
  useEffect(() => {
    if (isCustomerVerified) {
      loadDataWhenAuthenticated();
      loadWalletWhenAuthenticated();
    }
  }, [isCustomerVerified]);

  const router = useRouter();

  const handleInput = (text) => {
    // Navigate to the shop screen and send the search text as a param
    router.push({
      pathname: "/customer/shop/shop",
      params: { query: text },
    });
  };
  return (
    <View className="flex-1 bg-white" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <CustomerTopNav />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        
        <LocationBanner />
        <View className="flex-row items-center mt-4 bg-gray-100 mx-8 rounded-full px-4 py-2 mb-6 shadow-sm">
        <Ionicons name="search-outline" size={20} color="gray" />
        <TextInput
          placeholder="Search for products or stores"
          value={search}
          onChangeText={handleInput}
          className="ml-2 flex-1 text-sm"
        />
      </View>
        <HeroCarousel/>
        {/* <WalletCard /> */}
        <OrderTrackingManager />

        <ServiceSelector />
        
        <CategorySlider />
        

        <VendorList />
        
        
        
        
        <SupportAccess />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}