import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  KeyboardAvoidingView,
  Modal, 
  Platform,
  Pressable, 
  RefreshControl, 
  ScrollView, 
  Text, 
  TextInput, 
  View 
} from 'react-native';
import { useWallet } from '../../../context/customer/WalletContext';

export default function DeliverymanWalletPage() {
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

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        await getWalletInfo();
        await getWalletTransactions(1, 20);
      } catch (error) {
        console.error('Error loading wallet data:', error);
      }
    };
    loadWalletData();
  }, []);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getWalletInfo();
      await getWalletTransactions(1, 20);
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(topUpAmount);

    try {
      // ─── Updated description for deliveryman ───
      const result = await mockTopUp(amount, 'Deliveryman wallet top-up');
      
      if (result.success) {
        Alert.alert('Success', 'Funds added to your wallet successfully!');
        setShowTopUpModal(false);
        setTopUpAmount('');
        await getWalletInfo();
      } else {
        Alert.alert('Error', result.error || 'Top-up failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add funds to wallet');
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!bankDetails.bank_account || !bankDetails.bank_name || !bankDetails.account_holder_name) {
      Alert.alert('Missing Information', 'Please fill in all required bank details');
      return;
    }

    if (parseFloat(withdrawAmount) > wallet?.balance) {
      Alert.alert('Insufficient Balance', 'Withdrawal amount exceeds your wallet balance');
      return;
    }

    try {
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
        await getWalletInfo(); 
      } else {
        Alert.alert('Error', result.error || 'Withdrawal request failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit withdrawal request');
    }
  };

  const formatTransactionType = (type) => {
    switch (type) {
      case 'earning': return 'Earnings';
      case 'payment': return 'Payment';
      case 'refund': return 'Refund';
      case 'withdrawal': return 'Withdrawal';
      case 'topup': return 'Top-up';
      case 'adjustment': return 'Adjustment';
      default: return type;
    }
  };

  const formatAmount = (amount, type) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const formattedAmount = `$${Math.abs(numAmount).toFixed(2)}`;
    if (type === 'earning' || type === 'refund' || type === 'topup') {
      return `+ ${formattedAmount}`;
    } else {
      return `- ${formattedAmount}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
            <Text className="font-semibold text-gray-800 capitalize">
              {formatTransactionType(item.category || item.type)}
            </Text>
            <Text className="text-sm text-gray-500">
              {item.description || 'No description'}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`font-bold text-lg ${
            item.category === 'earning' || item.category === 'refund' || item.category === 'topup' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatAmount(item.amount, item.category || item.type)}
          </Text>
          <Text className="text-xs text-gray-400">
            Balance: ${typeof item.balance_after === 'number' ? item.balance_after.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !wallet) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="text-gray-600 mt-4">Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View className="mx-4 mt-6 mb-6">
          <View className="bg-white p-7 rounded-[20px] shadow">
            <Text className="text-gray-600 text-base font-medium">Current Balance</Text>
            <View className="flex-row items-end justify-between mt-2">
              <View>
                <Text className="text-gray-900 text-5xl font-bold">
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Last updated:{' '}
                  {wallet?.last_updated ? formatDate(wallet.last_updated) : 'Now'}
                </Text>
              </View>
              <View className="flex-row items-center space-x-1">
                <Ionicons name="lock-closed-outline" size={14} color="#666" />
                <Text className="text-xs text-gray-600">Secure Payment</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Withdraw Funds Section */}
        <Text className="text-xl font-bold text-gray-800 px-4 pb-3">Withdraw Funds</Text>
        <View className="bg-white mx-4 rounded-[20px] shadow py-1.5 mb-7">
          <Pressable
            onPress={() => setShowWithdrawModal(true)} 
            className="flex-row items-center justify-between px-4 py-4 rounded-lg"
          >
            <View className="flex-row items-center space-x-3">
              <Ionicons name="arrow-up-circle-outline" size={24} color="#28a745" />
              <Text className="text-base text-gray-800 font-medium">
                Request Bank Withdrawal
              </Text>
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
                No transactions yet
              </Text>
            </View>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl m-4">
            <Text className="text-red-800 font-medium">Error</Text>
            <Text className="text-red-600 text-sm mt-1">{error}</Text>
            <Pressable onPress={clearError} className="mt-2">
              <Text className="text-red-800 text-sm font-medium">Dismiss</Text>
            </Pressable>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Top Up Modal */}
      <Modal 
        visible={showTopUpModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTopUpModal(false)}
      >
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
                placeholderTextColor="#9CA3AF"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
              />
            </View>

            <Pressable
              onPress={handleTopUp}
              disabled={loading}
              className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-[#28a745]'}`}
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

      {/* Withdrawal Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="px-4 py-6 pt-12 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">Request Withdrawal</Text>
              <View className="w-6" />
            </View>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView 
              className="flex-1 px-4 py-6"
              keyboardShouldPersistTaps="handled"
            >
              {/* ─── Added balance card in withdrawal modal ─── */}
              <View className="bg-green-50 p-4 rounded-xl mb-4">
                <Text className="text-sm text-gray-600">Available Balance</Text>
                <Text className="text-2xl font-bold text-green-700">
                  ${parseFloat(wallet?.balance || 0).toFixed(2)}
                </Text>
              </View>

              <Text className="text-gray-600 mb-4">
                Enter amount and bank details to request a withdrawal.
              </Text>
              
              {/* Amount */}
              <Text className="text-gray-700 font-semibold mb-2">Amount</Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
              />
              
              {/* Bank Account */}
              <Text className="text-gray-700 font-semibold mb-2">Bank Account Number</Text>
              <TextInput
                value={bankDetails.bank_account}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, bank_account: text }))}
                placeholder="Bank Account Number"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
              />
              
              {/* Bank Name */}
              <Text className="text-gray-700 font-semibold mb-2">Bank Name</Text>
              <TextInput
                value={bankDetails.bank_name}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, bank_name: text }))}
                placeholder="Bank Name"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
              />
              
              {/* Account Holder Name */}
              <Text className="text-gray-700 font-semibold mb-2">Account Holder Name</Text>
              <TextInput
                value={bankDetails.account_holder_name}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, account_holder_name: text }))}
                placeholder="Account Holder Name"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
              />
              
              {/* IBAN */}
              <Text className="text-gray-700 font-semibold mb-2">IBAN (Optional)</Text>
              <TextInput
                value={bankDetails.iban}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text }))}
                placeholder="IBAN (Optional)"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg mb-4"
              />
              
              {/* Submit Button */}
              <Pressable
                onPress={handleWithdrawalRequest}
                disabled={loading}
                className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-[#28a745]'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center text-lg">
                    Submit Request
                  </Text>
                )}
              </Pressable>
              
              <View className="h-20" /> 
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}