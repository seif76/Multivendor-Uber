import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { VendorAuthContext } from '../../../context/VendorAuthContext';
import { useWallet } from '../../../context/customer/WalletContext';

export default function VendorHome() {
  const router = useRouter();
  const context = useContext(VendorAuthContext);
  const { wallet } = useWallet();

  if (!context) {
    console.warn("VendorAuthContext is undefined —  you forget to wrap with the provider");
    return null;
  }

  const { isVendorVerified, loading } = context;

  if (loading) return <Text>Loading...</Text>;
  if (!isVendorVerified) return <Text>Redirecting...</Text>;
  return (
    
    <ScrollView className="flex-1 bg-white p-5 pt-14">
      <Text className="text-2xl font-bold text-primary mb-6">Welcome Vendor</Text>

      {/* Create Shop */}
      <Pressable className="bg-primary p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Register & Create Shop</Text>
        <FontAwesome5 name="store" size={24} color="white" />
      </Pressable>

      {/* Receive Orders */}
      <Pressable className="bg-green-600 p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Receive Orders</Text>
        <Ionicons name="receipt-outline" size={26} color="white" />
      </Pressable>

      {/* Wallet Balance */}
      <Pressable 
        onPress={() => router.push('/vendor/wallet')}
        className="bg-green-100 p-5 rounded-xl mb-4"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-primary mb-2">Wallet Balance</Text>
            <Text className="text-2xl font-bold text-primary">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#007233" />
        </View>
      </Pressable>

      {/* Request Payout */}
      <Pressable 
        onPress={() => router.push('/vendor/wallet?action=withdraw')}
        className="bg-yellow-500 p-5 rounded-xl mb-4 flex-row items-center justify-between"
      >
        <Text className="text-white text-lg font-semibold">Request Payout</Text>
        <MaterialIcons name="account-balance-wallet" size={26} color="white" />
      </Pressable>

      {/* Communicate with Customers */}
      <View className="px-4 mt-6">
      <Text className="text-lg font-bold text-gray-800 mb-3">Need Help?</Text>
      <View className="flex-row justify-between">
        <Pressable className="w-[48%] bg-pink-100 rounded-xl py-4 items-center">
          <FontAwesome name="headphones" size={24} color="#d63384" />
          <Text className="text-pink-700 font-semibold mt-2">Live Support</Text>
        </Pressable>
        <Pressable className="w-[48%] bg-yellow-100 rounded-xl py-4 items-center">
          <FontAwesome name="exclamation-triangle" size={24} color="#e67e22" />
          <Text className="text-yellow-700 font-semibold mt-2">Report Issue</Text>
        </Pressable>
      </View>
    </View>
    </ScrollView>
    
  );
}
