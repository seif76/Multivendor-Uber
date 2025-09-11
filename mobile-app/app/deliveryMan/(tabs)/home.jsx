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
import { Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RideRequestPopup from '../../../components/deliveryman/custom/RideRequestPopup';
import DeliverymanMap from '../../../components/deliveryman/custom/maps';
import DeliveryOrderManager from '../../../components/deliveryman/custom/DeliveryOrderManager';
import { DeliverymanAuthContext } from '../../../context/DeliverymanAuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../../../context/customer/WalletContext';

export default function DeliverymanHome() {
  const router = useRouter();
  const context = useContext(DeliverymanAuthContext);
  const { wallet } = useWallet();

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
      <DeliveryOrderManager />
      
      {/* Wallet Balance Card - Floating */}
      <View className="absolute top-4 right-4 z-10">
        <Pressable 
          onPress={() => router.push('/deliveryMan/wallet')}
          className="bg-blue-600 p-4 rounded-xl shadow-lg"
        >
          <View className="items-center">
            <Ionicons name="wallet" size={20} color="white" />
            <Text className="text-white text-sm font-medium mt-1">Wallet</Text>
            <Text className="text-white text-lg font-bold">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

