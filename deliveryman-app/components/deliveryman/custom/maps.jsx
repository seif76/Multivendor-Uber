
// // components/CaptainMap.js
// import * as Location from 'expo-location';
// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View, Platform, Alert, Text } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
// import { socket } from '../../../config/socket'; // adjust path as needed

// export default function DeliverymanMap() {
//   const [location, setLocation] = useState(null);

//   useEffect(() => {
//     const getAndSendLocation = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') return;

//       const currentLocation = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = currentLocation.coords;

//       const newLoc = { latitude, longitude };
//       setLocation(newLoc);
//       //alert(JSON.stringify(newLoc) );
    
//        //const deliverymanId = "deliveryman-1"
//       //socket.emit('deliverymanLocation',  { deliverymanId, coords: newLoc });
//     };

//     getAndSendLocation();
//     const interval = setInterval(getAndSendLocation, 5000); // Send every 5 sec

//     return () => clearInterval(interval);
//   }, []);

//   // Choose provider based on platform
//   const mapProvider = Platform.OS === 'android' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE;

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={{
//           latitude: location?.latitude || 32.8872,
//           longitude: location?.longitude || 13.1913,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation
//         showsMyLocationButton
//         provider={PROVIDER_GOOGLE}
//       >
//         {location && (
//           <Marker
//             coordinate={location}
//             title="You (Deliveryman)"
//             pinColor="green"
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


import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function DeliverymanMap() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>* { margin:0; padding:0; } html,body,#map { width:100%; height:100vh; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([32.8872, 13.1913], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([32.8872, 13.1913]).addTo(map).bindPopup('You are here').openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html }}
        javaScriptEnabled
        originWhitelist={['*']}
      />
    </View>
  );
}
