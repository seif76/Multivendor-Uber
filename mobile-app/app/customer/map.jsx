
// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { socket } from '../../config/socket'; // adjust path as needed

// export default function CustomerMap() {
//   const [captainLocation, setCaptainLocation] = useState(null);

//   const INITIAL_REGION = {
//     latitude: 32.8872, // Tripoli
//     longitude: 13.1913,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   useEffect(() => {
//     socket.on('captainLocationUpdate', (data) => {
//       setCaptainLocation(data);
//     });

//     return () => {
//       socket.off('captainLocationUpdate');
//     };
//   }, []);

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={INITIAL_REGION}
//         provider={PROVIDER_GOOGLE}
//         showsUserLocation
//         showsMyLocationButton
//       >
//         {captainLocation && (
//           <Marker
//             coordinate={captainLocation}
//             title="Captain"
//             pinColor="red"
//           />
//         )}
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });



import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { socket } from '../../config/socket';



export default function CustomerMap() {
  const [location, setLocation] = useState(null);
  const [captains, setCaptains] = useState({});
  const router = useRouter();

  const INITIAL_REGION = {
    latitude: 32.8872, // Tripoli
    longitude: 13.1913,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      socket.emit('getNearbyCaptains');
    })();

    socket.on('captainsUpdate', (data) => {
      setCaptains(data);
    });

    return () => {
      socket.off('captainsUpdate');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push('/')} className="z-[100] mt-10 ml-4 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location?.latitude || INITIAL_REGION.latitude,
          longitude: location?.longitude || INITIAL_REGION.longitude,
          latitudeDelta: INITIAL_REGION.latitudeDelta,
          longitudeDelta: INITIAL_REGION.longitudeDelta,
        }}
        showsUserLocation
        showsMyLocationButton
        provider={PROVIDER_GOOGLE}
      >
        {Object.entries(captains).map(([captainId, captain], index) => (
          <Marker
            key={captainId}
            coordinate={{ latitude: captain.latitude, longitude: captain.longitude }}
            title={`Captain ${captainId}`}
            pinColor="red"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
