// File: app/customer/select-address.jsx
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function SelectAddress() {
  const router = useRouter();
  const destinationRef = useRef();
  const [pickup, setPickup] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
      if (reverseGeocode?.[0]) {
        const { street, name, city } = reverseGeocode[0];
        setPickup(`${name || ''} , ${city || ''} sssssssssssssssssss ` );
      }

    //   const { coords } = await Location.getCurrentPositionAsync({});
    //   const [place] = await Location.reverseGeocodeAsync({
    //     latitude: coords.latitude,
    //     longitude: coords.longitude,
    //   });
    
    //   alert(JSON.stringify( place));



    })();
  }, []);

  const onPlaceSelected = (data, details) => {
    if (!details) return;
    const { lat, lng } = details.geometry.location;
    console.log('Selected destination:', data.description, lat, lng);
    // Save or use location here
    router.back();
  };

  return (
    <View className="flex-1 bg-white px-4 pt-14">
      {/* Back Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Select Address</Text>
      </View>

      {/* Pickup Address (Current Location) */}
      {/* <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-xl mb-3">
        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
        <TextInput
          value={pickup}
          editable={false}
          className="flex-1 text-right"
        />
      </View> */}
      <View className="flex-row items-center bg-gray-100   px-3 py-2 rounded-xl mb-3">
  <View className="  w-3 h-3 bg-green-500 rounded-full mr-2" />
  <TextInput
    value={pickup}
    editable={false}
    multiline={true}
    textAlignVertical="top"
    className="flex-1 pl-4 text-left min-h-[50px]" // adjust height if needed
  />
</View>

      {/* Destination Autocomplete */}
      <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-xl mb-4">
        <View className="w-3 h-3 bg-orange-400 rounded-full mr-2" />
        <View className="flex-1">
          <GooglePlacesAutocomplete
            ref={destinationRef}
            placeholder="Where to?"
            fetchDetails={true}
            onPress={onPlaceSelected}
            query={{
              key: MAPS_API_KEY,
              language: 'en',
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
            styles={{
              textInput: {
                backgroundColor: 'transparent',
                height: 40,
                fontSize: 16,
              },
              listView: { borderRadius: 8 },
            }}
          />
        </View>
        <TouchableOpacity className="ml-2">
          <Ionicons name="add" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Recent Locations */}
      <FlatList
        data={recentLocations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable className="py-3 border-b border-gray-100">
            <Text className="font-semibold">{item.title}</Text>
            <Text className="text-gray-600 text-sm">{item.address}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
