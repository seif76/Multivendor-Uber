import React, { useContext, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
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

export default function CustomerHomePage() {
  const { isCustomerVerified } = useContext(CustomerAuthContext);
  const { loadDataWhenAuthenticated } = useHome();
  const { loadWalletWhenAuthenticated } = useWallet();
  const { isRTL } = useLanguage();

  // Load data when user becomes authenticated
  useEffect(() => {
    if (isCustomerVerified) {
      loadDataWhenAuthenticated();
      loadWalletWhenAuthenticated();
    }
  }, [isCustomerVerified]);

  return (
    <View className="flex-1 bg-white" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <CustomerTopNav />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        <LocationBanner />
        <ServiceSelector />
        
        <CategorySlider />
        <VendorList />
        
        <OrderTrackingManager />
        <WalletCard />
        
        
        <SupportAccess />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}