import React from 'react';
import { View } from 'react-native';
import CustomerHomeScreen from '../../../components/customer/screens/customerHomeScreen';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CustomerHomePage() {
  return (
    <SafeAreaView className="flex-1">
    <View className="flex-1 bg-white">
        <CustomerHomeScreen />
    </View>
    </SafeAreaView>
  );
}