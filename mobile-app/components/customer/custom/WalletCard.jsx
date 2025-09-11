import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useWallet } from '../../../context/customer/WalletContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function WalletCard() {
  const router = useRouter();
  const { wallet, loading, error } = useWallet();
  const { t } = useLanguage();

  const handlePress = () => {
    router.push('/customer/wallet');
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '$0.00';
    return `$${parseFloat(balance).toFixed(2)}`;
  };

  if (loading && !wallet) {
    return (
      <View className="mx-4 mt-6 bg-gray-100 p-4 rounded-xl">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#007233" />
          <Text className="text-gray-600 ml-2">{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mx-4 mt-6 bg-red-100 p-4 rounded-xl">
        <Text className="text-red-800 font-bold">{t('wallet.title')} {t('common.error')}</Text>
        <Text className="text-red-700 text-sm mt-1">{error}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={handlePress} className="mx-4 mt-6">
      <View className="bg-primary p-4 rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-sm font-medium opacity-90">{t('wallet.currentBalance')}</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {formatBalance(wallet?.balance)}
            </Text>
            <Text className="text-white text-xs mt-1 opacity-80">
              {t('wallet.tapToViewTransactions')}
            </Text>
          </View>
          <View className="bg-white/20 p-3 rounded-full">
            <Ionicons name="wallet" size={24} color="white" />
          </View>
        </View>
        
        {/* Quick Actions */}
        <View className="flex-row mt-4 mx-4 space-between space-x-3">
          <Pressable 
            onPress={() => router.push('/customer/wallet?action=topup')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            className="flex-1 py-2 px-3 rounded-lg mr-2"
          >
            <Text style={{ color: 'white' }} className="text-xs font-medium text-center">{t('wallet.topUp')}</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.push('/customer/wallet?action=withdraw')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            className="flex-1 py-2 px-3 rounded-lg mr-2"
          >
            <Text style={{ color: 'white' }} className="text-xs font-medium text-center">{t('wallet.withdraw')}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
