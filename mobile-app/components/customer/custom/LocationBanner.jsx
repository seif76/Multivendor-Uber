import { Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

export default function LocationBanner() {
  const [pickup, setPickup] = useState('');
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
      if (reverseGeocode?.[0]) {
        const { street, name, city } = reverseGeocode[0];
        setPickup(city );
      }


    })();
  }, []);
  return (
    <View className="px-4 py-2 bg-gray-50 flex-row items-center space-x-2">
      <Entypo name="location-pin" size={20} color="#0f9d58" />
      <Text className="text-gray-700 font-semibold">{pickup || "enable location to get your current location"}</Text>
    </View>
  );
}
