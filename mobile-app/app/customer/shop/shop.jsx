// screens/customer/ShopScreen.jsx
import React from 'react';
import { View } from 'react-native';
import CustomerShopScreen from '../../../components/customer/screens/customerShopScreen';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function ShopPage() {
  
  
  return (
        <SafeAreaView className="flex-1">
    <View className="flex-1 bg-white p-4">
     <CustomerShopScreen/>
    </View>
        </SafeAreaView>
    
  );
}
