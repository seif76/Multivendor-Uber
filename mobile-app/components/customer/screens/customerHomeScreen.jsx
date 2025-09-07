import React from 'react';
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
import TestNotification from '../custom/TestNotifications';

export default function CustomerHomePage() {
  return (
    <View className="flex-1 bg-white">
      <CustomerTopNav />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <LocationBanner />
        <ServiceSelector />
        <OrderTrackingManager />
        <CategorySlider />
        <VendorList />
        <DealsSection />
        <WalletCard />
        <SupportAccess />
        <TestNotification />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}