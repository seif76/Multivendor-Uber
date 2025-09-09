// import { useContext } from 'react';
// import { View } from 'react-native';
// import RideRequestPopup from '../../../components/captain/custom/RideRequestPopup';
// import CaptainMap from '../../../components/captain/custom/maps';
// import { CaptainAuthContext } from '../../../context/CaptainAuthContext';


// export default function CaptainHome() {

//   // const { isCaptainVerified, loading } = useContext(CaptainAuthContext);

//   // if (loading) return <p>Loading...</p>;
//   // if (!isCaptainVerified) return null; // Already redirected in context
//   const context = useContext(CaptainAuthContext);

//   if (!context) {
//     return <Text>Context is undefined</Text>; // Fallback
//   }

//   const { isCaptainVerified, loading } = context;

//   if (loading) return <Text>Loading...</Text>;
//   if (!isCaptainVerified) return <Text>Redirecting...</Text>;

//   return (
//     <View className="flex-1">
//      <CaptainMap />
//      <RideRequestPopup/>
//     </View>
//   );
// }


import { useContext } from 'react';
import { Text, View, ScrollView } from 'react-native';
import RideRequestPopup from '../../../components/deliveryman/custom/RideRequestPopup';
import DeliverymanMap from '../../../components/deliveryman/custom/maps';
import DeliveryOrderManager from '../../../components/deliveryman/custom/DeliveryOrderManager';
import { DeliverymanAuthContext } from '../../../context/DeliverymanAuthContext';

export default function CaptainHome() {
  // const checkToken = async () => {
  //   try {

  //     const token = await AsyncStorage.getItem('token');
  //     alert('Token: ' + token);
  //     console.log(token);
  //   } catch (err) {
  //     console.error('Failed to read token:', err);
  //   }
  // };
  // checkToken();


  // redirecting and auth staff
  const context = useContext(DeliverymanAuthContext);

  if (!context) {
    console.warn("DeliverymanAuthContext is undefined —  you forget to wrap with the provider");
    return null;
  }

  const { isDeliverymanVerified, loading } = context;

  if (loading) return <Text>Loading...</Text>;
  if (!isDeliverymanVerified) return <Text>Redirecting...</Text>;

  return (
    <View className="flex-1 bg-gray-50">
      
        
      <DeliverymanMap />
        {/* Real-time Delivery Orders */}
        <DeliveryOrderManager />
          
         
      
      
    </View>
  );
}

