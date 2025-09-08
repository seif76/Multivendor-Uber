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
  View 
} from 'react-native';
import { useWallet } from '../../../context/customer/WalletContext';

export default function WalletPage() {
  const router = useRouter();
  const { action } = useLocalSearchParams();
  const { 
    wallet, 
    transactions, 
    loading, 
    error, 
    getWalletInfo, 
    getWalletTransactions,
    mockTopUp,
    createWithdrawalRequest,
    clearError 
  } = useWallet();

  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bank_account: '',
    bank_name: '',
    account_holder_name: '',
    iban: ''
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

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!bankDetails.bank_account || !bankDetails.bank_name || !bankDetails.account_holder_name) {
      Alert.alert('Error', 'Please fill in all required bank details');
      return;
    }

    const result = await createWithdrawalRequest(parseFloat(withdrawAmount), bankDetails);
    if (result.success) {
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankDetails({
        bank_account: '',
        bank_name: '',
        account_holder_name: '',
        iban: ''
      });
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment': return 'card';
      case 'earning': return 'trending-up';
      case 'refund': return 'refresh';
      case 'withdrawal': return 'arrow-up';
      case 'topup': return 'add-circle';
      case 'adjustment': return 'settings';
      default: return 'wallet';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'payment': return 'text-red-600';
      case 'earning': return 'text-green-600';
      case 'refund': return 'text-blue-600';
      case 'withdrawal': return 'text-orange-600';
      case 'topup': return 'text-green-600';
      case 'adjustment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const renderTransaction = ({ item }) => (
    <View className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-gray-100 p-2 rounded-full mr-3">
            <Ionicons name={getTransactionIcon(item.type)} size={20} color="#666" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 capitalize">{item.type}</Text>
            <Text className="text-sm text-gray-500">{item.description}</Text>
            <Text className="text-xs text-gray-400">{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`font-bold ${getTransactionColor(item.type)}`}>
            {item.type === 'payment' || item.type === 'withdrawal' ? '-' : '+'}${parseFloat(item.amount).toFixed(2)}
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
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">Loading wallet...</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View className="mx-4 mt-6">
          <View style={{ backgroundColor: '#10b981' }} className="p-6 rounded-xl shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ color: 'white' }} className="text-sm font-medium opacity-90">Total Balance</Text>
                <Text style={{ color: 'white' }} className="text-3xl font-bold mt-1">
                  {formatBalance(wallet?.balance)}
                </Text>
                <Text style={{ color: 'white' }} className="text-xs mt-1 opacity-80">
                  Last updated: {wallet?.last_updated ? formatDate(wallet.last_updated) : 'Never'}
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="p-4 rounded-full">
                <Ionicons name="wallet" size={32} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-6 flex-row space-x-3">
          <Pressable 
            onPress={() => setShowTopUpModal(true)}
            style={{ backgroundColor: '#3b82f6' }}
            className="flex-1 py-3 px-4 rounded-lg"
          >
            <Text style={{ color: 'white' }} className="font-semibold text-center">Top Up</Text>
          </Pressable>
          <Pressable 
            onPress={() => setShowWithdrawModal(true)}
            style={{ backgroundColor: '#f97316' }}
            className="flex-1 py-3 px-4 rounded-lg"
          >
            <Text style={{ color: 'white' }} className="font-semibold text-center">Withdraw</Text>
          </Pressable>
        </View>

        {/* Error Display */}
        {error && (
          <View className="mx-4 mt-4 bg-red-100 p-3 rounded-lg">
            <Text className="text-red-800 text-sm">{error}</Text>
            <Pressable onPress={clearError} className="mt-2">
              <Text className="text-red-600 text-xs">Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Transactions */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</Text>
          {transactions && transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Text className="text-gray-500 text-center">No transactions yet</Text>
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="px-4 py-6 pt-12 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">Top Up Wallet</Text>
              <View className="w-6" />
            </View>
          </View>

          <View className="flex-1 px-4 py-6">
            <Text className="text-gray-600 mb-4">
              Add funds to your wallet for easy payments
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
              style={{ backgroundColor: loading ? '#9ca3af' : '#3b82f6' }}
              className="py-4 rounded-lg"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white' }} className="font-semibold text-center text-lg">
                  Add ${topUpAmount || '0.00'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
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

          <ScrollView className="flex-1 px-4 py-6">
            <Text className="text-gray-600 mb-4">
              Request a withdrawal to your bank account
      </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
              <TextInput
                placeholder="Enter amount"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Bank Account Number *</Text>
              <TextInput
                placeholder="Enter bank account number"
                value={bankDetails.bank_account}
                onChangeText={(text) => setBankDetails({...bankDetails, bank_account: text})}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Bank Name *</Text>
              <TextInput
                placeholder="Enter bank name"
                value={bankDetails.bank_name}
                onChangeText={(text) => setBankDetails({...bankDetails, bank_name: text})}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Account Holder Name *</Text>
              <TextInput
                placeholder="Enter account holder name"
                value={bankDetails.account_holder_name}
                onChangeText={(text) => setBankDetails({...bankDetails, account_holder_name: text})}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">IBAN (Optional)</Text>
              <TextInput
                placeholder="Enter IBAN"
                value={bankDetails.iban}
                onChangeText={(text) => setBankDetails({...bankDetails, iban: text})}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </View>

            <Pressable 
              onPress={handleWithdraw}
              disabled={loading}
              style={{ backgroundColor: loading ? '#9ca3af' : '#f97316' }}
              className="py-4 rounded-lg"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white' }} className="font-semibold text-center text-lg">
                  Request Withdrawal
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}