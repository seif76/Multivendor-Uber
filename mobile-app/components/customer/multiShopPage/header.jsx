import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';




export default function ShopHeader() {
    const [address, setAddress] = useState('');
    const router  = useRouter();
    const { getCartItems } = useContext(CartContext);
    const [itemCount, setItemCount] = useState(0);
  
    useEffect(() => {
      const items = getCartItems();
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setItemCount(count);
    }, [getCartItems]);


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
        <Pressable onPress={() => router.push('/customer/shop/cart')} className="relative ">
      <Ionicons name="cart-outline" size={24} color="black" />
      {itemCount > 0 && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-white text-xs">{itemCount}</Text>
        </View>
      )}
    </Pressable>
      </View>
  );
}
