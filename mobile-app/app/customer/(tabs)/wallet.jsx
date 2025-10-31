import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useWallet } from '../../../context/customer/WalletContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function WalletPage() {
  const router = useRouter();
  const { action } = useLocalSearchParams();
  const {
    wallet,
    transactions,
    loading,
    error,
    getWalletInfo,
    mockTopUp,
    createWithdrawalRequest,
    clearError,
  } = useWallet();
  const { t } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bank_account: '',
    bank_name: '',
    account_holder_name: '',
    iban: '',
  });

  useEffect(() => {
    if (action === 'topup') {
      setShowTopUpModal(true);
    } else if (action === 'withdraw') {
      setShowWithdrawModal(true);
    }
  }, [action]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getWalletInfo();
    setRefreshing(false);
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const result = await mockTopUp(parseFloat(topUpAmount), 'Wallet top-up');
    if (result.success) {
      Alert.alert('Success', 'Wallet topped up successfully!');
      setShowTopUpModal(false);
      setTopUpAmount('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '$0.00';
    return `$${parseFloat(balance).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const renderTransaction = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-gray-100 p-3 rounded-full mr-3">
            <Ionicons name="swap-horizontal" size={20} color="#666" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 capitalize">{item.type}</Text>
            <Text className="text-sm text-gray-500">{item.description}</Text>
            <Text className="text-xs text-gray-400">{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text
            className={`font-bold ${
              item.type === 'payment' || item.type === 'withdrawal'
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {item.type === 'payment' || item.type === 'withdrawal' ? '-' : '+'}$ 
            {parseFloat(item.amount).toFixed(2)}
          </Text>
          <Text className="text-xs text-gray-400">
            Balance: ${parseFloat(item.balance_after).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !wallet) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="text-gray-600 mt-4">{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 pt-12 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-800">Wallet</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card - Bigger + fixed light bg in dark mode */}
        <View className="mx-4 mt-6 mb-6">
          <View
            style={{
              backgroundColor: '#ffffff',
              padding: 28,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text className="text-gray-600 text-base font-medium">Current Balance</Text>
            <View className="flex-row items-end justify-between mt-2">
              <View>
                <Text className="text-gray-900 text-5xl font-bold">
                  {formatBalance(wallet?.balance)}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Last updated:{' '}
                  {wallet?.last_updated ? formatDate(wallet.last_updated) : 'Now'}
                </Text>
              </View>
              <View className="flex-row items-center space-x-1">
                <Ionicons name="lock-closed-outline" size={16} color="#666" />
                <Text className="text-xs text-gray-600">Secure Payment</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Balance Section - slightly larger */}
        <Text className="text-xl font-bold text-gray-800 px-4 pb-3">Add Balance</Text>
        <View
          style={{
            backgroundColor: '#ffffff',
            marginHorizontal: 16,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
            paddingVertical: 6,
            marginBottom: 28,
          }}
        >
          <Pressable
            onPress={() => setShowTopUpModal(true)}
            className="flex-row items-center justify-between px-4 py-4 rounded-lg"
          >
            <View className="flex-row items-center space-x-3">
              <Ionicons name="card-outline" size={24} color="#28a745" />
              <Text className="text-base text-gray-800 font-medium">
                Top-up via Card Online
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>

          <View className="border-t border-gray-200 mx-4" />

          <Pressable
            onPress={() => Alert.alert('Office top-up', 'Coming soon...')}
            className="flex-row items-center justify-between px-4 py-4 rounded-lg"
          >
            <View className="flex-row items-center space-x-3">
              <Ionicons name="storefront-outline" size={24} color="#28a745" />
              <Text className="text-base text-gray-800 font-medium">
                Top-up via Office (Card or Cash)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>

          <View className="border-t border-gray-200 mx-4" />

          <Pressable
            onPress={() => Alert.alert('LyPay', 'Coming soon...')}
            className="flex-row items-center justify-between px-4 py-4 rounded-lg"
          >
            <View className="flex-row items-center space-x-3">
              <Ionicons name="phone-portrait-outline" size={24} color="#28a745" />
              <Text className="text-base text-gray-800 font-medium">Top-up via LyPay</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>
        </View>

        {/* Recent Transactions */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</Text>
          {transactions && transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-center">
                No transactions available
              </Text>
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="px-4 py-6 pt-12 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">Add Funds</Text>
              <View className="w-6" />
            </View>
          </View>

          <View className="flex-1 px-4 py-6">
            <Text className="text-gray-600 mb-4">
              Enter an amount to top-up your wallet balance.
            </Text>

            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
              <TextInput
                placeholder="Enter amount"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
              />
            </View>

            <Pressable
              onPress={handleTopUp}
              disabled={loading}
              style={{ backgroundColor: loading ? '#9ca3af' : '#28a745' }}
              className="py-4 rounded-lg"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Add ${topUpAmount || '0.00'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal (kept functional but hidden in UI) */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="px-4 py-6 pt-12 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">Withdraw Funds</Text>
              <View className="w-6" />
            </View>
          </View>
          {/* Modal content kept functional but hidden in UI */}
        </View>
      </Modal>
    </View>
  );
}
