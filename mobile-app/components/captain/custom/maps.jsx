import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapViewComponent() {
    const INITIAL_REGION = {
        latitude: 32.8872,        // Tripoli, Libya
        longitude: 13.1913,
        latitudeDelta: 2,
        longitudeDelta: 2,
      };
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
		showsUserLocation
		showsMyLocationButton
		provider={PROVIDER_GOOGLE}
      >
        <Marker coordinate={{ latitude: 31.2001, longitude: 29.9187 }} title="Captain Location" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});




// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// const DUMMY_LOCATION = {
//   latitude: 32.8872, // Tripoli, Libya
//   longitude: 13.1913,
//   latitudeDelta: 0.05,
//   longitudeDelta: 0.05,
// };

// export default function DummyUserLocationMap() {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={StyleSheet.absoluteFillObject}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={DUMMY_LOCATION}
//         showsMyLocationButton // disables actual GPS
//         showsUserLocation={false}     // disables actual GPS dot
//       >
//         {/* Fake user location marker */}
//         <Marker
//           coordinate={{
//             latitude: DUMMY_LOCATION.latitude,
//             longitude: DUMMY_LOCATION.longitude,
//           }}
//           title="You (Simulated)"
//           pinColor="green"
//         />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

