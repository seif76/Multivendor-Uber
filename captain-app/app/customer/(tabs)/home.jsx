import React from 'react';
import { View } from 'react-native';
import CustomerHomeScreen from '../../../components/customer/screens/customerHomeScreen';

export default function CustomerHomePage() {
  return (
    <View className="flex-1 bg-white">
        <CustomerHomeScreen />
    </View>
  );
}