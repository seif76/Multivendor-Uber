// import React, { useRef } from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';
// import 'react-native-get-random-values';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


// //import { GOOGLE_MAPS_API_KEY } from '@env';

// export default function LocationSearchBox({ onPlaceSelected }) {
//   const ref = useRef();
  
//   return (
//     <View className="absolute bottom-28 left-4 right-4 bg-white rounded-2xl p-4 shadow z-50">
//       {/* Header */}
//       <View className="flex-row items-center justify-between mb-2">
//         <Text className="text-lg font-bold">Where to?</Text>
//         <TouchableOpacity className="bg-green-500 px-3 py-1 rounded-full">
//           <Text className="text-white text-xs">Get a ride with 10% off coupon!</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Search Box */}
//       <GooglePlacesAutocomplete
//         ref={ref}
//         placeholder="Search for a destination..."
//         fetchDetails={true}
//         debounce={200}
//         enableHighAccuracyLocation={true}
//         onPress={(data, details = null) => {
//             if (!details || !details.geometry || !details.geometry.location) return;
          
//             const { lat, lng } = details.geometry.location;
//             onPlaceSelected({
//               latitude: lat,
//               longitude: lng,
//               description: data.description,
//             });
//           }}
//         query={{
//           key: 'AIzaSyDH1wWCQY2Q5kPjPzyNGA1NoGjq0r05GyQ',
//           language: 'en',
//         }}
//         predefinedPlaces={[]}
//         textInputProps={{}}
//         styles={{
//           textInput: {
//             backgroundColor: '#f1f5f9',
//             height: 45,
//             borderRadius: 8,
//             paddingHorizontal: 10,
//             fontSize: 16,
//           },
//           listView: { borderRadius: 8 },
//         }}
//       />
//     </View>
//   );
// }


import { useRouter } from 'expo-router';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function LocationSearchBox() {
  const router = useRouter();

  return (
    <View className="absolute bottom-28 left-4 right-4 bg-white rounded-2xl p-4 shadow z-50">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold">Where to?</Text>
        <TouchableOpacity className="bg-green-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs">Get a ride with 10% off coupon!</Text>
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => router.push('/customer/select-address')} // link to full-screen selector
        className="bg-slate-100 px-4 py-3 rounded-xl"
      >
        <Text className="text-gray-500">Search for a destination...</Text>
      </Pressable>
    </View>
  );
}

