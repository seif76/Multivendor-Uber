import { useContext } from 'react';
import { Text, View } from 'react-native';
import { CaptainAuthContext } from '../../../context/CaptainAuthContext';

export default function WalletScreen() {

  // redirecting and auth staff
  const context = useContext(CaptainAuthContext);

  if (!context) {
    console.warn("CaptainAuthContext is undefined —  you forget to wrap with the provider");
    return null;
  }

  const { isCaptainVerified, loading } = context;

  if (loading) return <Text>Loading...</Text>;
  if (!isCaptainVerified) return <Text>Redirecting...</Text>;


  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-green-600 mb-4">Wallet</Text>
      <View className="bg-gray-100 p-4 rounded-lg shadow">
        <Text className="text-lg font-medium">Balance:</Text>
        <Text className="text-3xl font-bold text-green-700 mt-2">$325.50</Text>
      </View>

      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2">Recent Transactions</Text>
        <View className="bg-white border p-3 rounded mb-2">
          <Text className="font-semibold">Ride Payment</Text>
          <Text className="text-sm text-gray-600">+ $20.00 — Jun 28, 2025</Text>
        </View>
        <View className="bg-white border p-3 rounded mb-2">
          <Text className="font-semibold">Withdrawal</Text>
          <Text className="text-sm text-gray-600">- $50.00 — Jun 27, 2025</Text>
        </View>
      </View>
    </View>
  );
}
