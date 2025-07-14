import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';




export default function ShopHeader() {
    const [address, setAddress] = useState('');

    useEffect(() => {
        (async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;
    
          const location = await Location.getCurrentPositionAsync({});
          const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
          if (reverseGeocode?.[0]) {
            const { street, name, city } = reverseGeocode[0];
            setAddress(`${name || ''} , ${city || ''} ` );
          }
        })();
      }, []);
  return (
    <View className="flex-row items-center justify-between mb-4">
        
        <Text className="text-gray-700 font-medium">
          Deliver to <Text className="text-black">{address}</Text>
        </Text>
        <Ionicons name="cart-outline" size={24} color="black" />
      </View>
  );
}
