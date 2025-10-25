// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// export default function MapViewComponent() {
//     const INITIAL_REGION = {
//         latitude: 32.8872,        // Tripoli, Libya
//         longitude: 13.1913,
//         latitudeDelta: 2,
//         longitudeDelta: 2,
//       };
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={INITIAL_REGION}
// 		showsUserLocation
// 		showsMyLocationButton
// 		provider={PROVIDER_GOOGLE}
//       >
//         <Marker coordinate={{ latitude: 31.2001, longitude: 29.9187 }} title="Captain Location" />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });





// components/CaptainMap.js
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { socket } from '../../../config/socket'; // adjust path as needed

export default function CaptainMap() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getAndSendLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      const newLoc = { latitude, longitude };
      setLocation(newLoc);
      //alert(JSON.stringify(newLoc) );
    
       const captainId = "captain-1"
      socket.emit('captainLocation',  { captainId, coords: newLoc });
    };

    getAndSendLocation();
    const interval = setInterval(getAndSendLocation, 5000); // Send every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location?.latitude || 32.8872,
          longitude: location?.longitude || 13.1913,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
        provider={PROVIDER_GOOGLE}
      >
        {location && (
          <Marker
            coordinate={location}
            title="You (Captain)"
            pinColor="green"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

