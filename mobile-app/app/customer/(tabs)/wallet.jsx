import React from 'react';
import { View, Text } from 'react-native';

export default function WalletPage() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>Wallet</Text>
      <Text style={{ fontSize: 18, color: '#666' }}>
        Your wallet balance: $0.00
      </Text>
      <Text style={{ fontSize: 16, color: '#aaa', marginTop: 20 }}>
        (This is a static wallet page.)
      </Text>
    </View>
  );
}