import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function WalletCard({ wallet }) {
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-primary">Wallet Balance</Text>
        <MaterialIcons name="account-balance-wallet" size={22} color="#0f9d58" />
      </View>
      <Text className="text-2xl font-bold text-primary mb-2">${wallet.balance}</Text>
      <Text className="text-xs text-gray-500 mb-1">Recent Payouts:</Text>
      {wallet.recentPayouts.map((p) => (
        <Text key={p.id} className="text-xs text-gray-700">- ${p.amount} on {p.date}</Text>
      ))}
    </View>
  );
} 