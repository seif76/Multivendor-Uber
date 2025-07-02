import React from 'react';
import { Text, View } from 'react-native';

export default function WalletCard() {
  return (
    <View className="mx-4 mt-6 bg-green-100 p-4 rounded-xl">
      <Text className="text-green-800 font-bold">Wallet Balance: $120.50</Text>
      <Text className="text-green-700 text-sm mt-1">Tap to view transactions</Text>
    </View>
  );
}
