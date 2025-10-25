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

export default function VendorWalletPage() {
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

  // Handle top-up
  const handleTopUp = async () => {
    console.log('🔄 Vendor Top-up initiated');
    console.log('💰 Top-up amount:', topUpAmount);
    
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      console.log('❌ Invalid amount provided:', topUpAmount);
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(topUpAmount);
    console.log('💵 Parsed amount:', amount);

    try {
      console.log('🚀 Calling mockTopUp API...');
      const result = await mockTopUp(amount, 'Vendor wallet top-up');
      console.log('📊 Top-up result:', result);
      
      if (result.success) {
        console.log('✅ Top-up successful!');
        Alert.alert('Success', 'Funds added to your wallet successfully!');
        setShowTopUpModal(false);
        setTopUpAmount('');
        console.log('🔄 Refreshing wallet info...');
        await getWalletInfo();
        console.log('✅ Wallet info refreshed');
      } else {
        console.log('❌ Top-up failed:', result.error);
        Alert.alert('Error', result.error || 'Top-up failed');
      }
    } catch (error) {
      console.error('💥 Top-up error:', error);
      Alert.alert('Error', 'Failed to add funds to wallet');
    }
  };

  // Handle withdrawal request
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
      } else {
        Alert.alert('Error', result.error || 'Withdrawal request failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit withdrawal request');
    }
  };

  // Format transaction type for display
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

  // Format transaction amount
  const formatAmount = (amount, type) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const formattedAmount = `$${Math.abs(numAmount).toFixed(2)}`;
    if (type === 'earning' || type === 'refund' || type === 'topup') {
      return `+ ${formattedAmount}`;
    } else {
      return `- ${formattedAmount}`;
    }
  };

  // Render transaction item
  const renderTransaction = ({ item }) => (
    <View className="bg-white border border-gray-200 p-4 rounded-lg mb-3 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base">
            {formatTransactionType(item.type)}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {item.description || 'No description'}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`font-bold text-lg ${
            item.type === 'earning' || item.type === 'refund' || item.type === 'topup' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatAmount(item.amount, item.type)}
          </Text>
          <Text className="text-xs text-gray-500">
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
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Vendor Wallet</Text>
          <Pressable 
            onPress={onRefresh}
            className="p-2 rounded-full bg-white shadow-sm"
          >
            <Ionicons name="refresh" size={20} color="#007233" />
          </Pressable>
        </View>

        {/* Balance Card */}
        <View style={{ 
          backgroundColor: '#007233', 
          padding: 24, 
          borderRadius: 16, 
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', marginBottom: 8 }}>
            Current Balance
          </Text>
          <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 }}>
            Last updated: {wallet?.last_updated ? new Date(wallet.last_updated).toLocaleDateString() : 'Never'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-4 mb-6">
          <Pressable 
            onPress={() => setShowTopUpModal(true)}
            className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <View className="items-center">
              <Ionicons name="add-circle" size={24} color="#007233" />
              <Text className="text-gray-900 font-medium mt-2">Top Up</Text>
            </View>
          </Pressable>
          
          <Pressable 
            onPress={() => setShowWithdrawModal(true)}
            className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <View className="items-center">
              <Ionicons name="arrow-up-circle" size={24} color="#007233" />
              <Text className="text-gray-900 font-medium mt-2">Withdraw</Text>
            </View>
          </Pressable>
        </View>

        {/* Recent Transactions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</Text>
          
          {transactions && transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Text className="text-gray-500 text-center">No transactions yet</Text>
            </View>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
            <Text className="text-red-800 font-medium">Error</Text>
            <Text className="text-red-600 text-sm mt-1">{error}</Text>
            <Pressable onPress={clearError} className="mt-2">
              <Text className="text-red-800 text-sm font-medium">Dismiss</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Top-up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full max-w-sm"
          >
            <View className="bg-white rounded-2xl p-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">Add Funds</Text>
              <TextInput
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
              />
              <View className="flex-row space-x-3">
                <Pressable 
                  onPress={() => setShowTopUpModal(false)}
                  className="flex-1 bg-gray-200 p-3 rounded-lg"
                >
                  <Text className="text-gray-800 text-center font-medium">Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handleTopUp}
                  className="flex-1 bg-green-600 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-medium">Add Funds</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full max-w-sm"
          >
            <View className="bg-white rounded-2xl max-h-[80%]">
              <ScrollView 
                className="p-6"
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <Text className="text-xl font-bold text-gray-900 mb-4">Request Withdrawal</Text>
                
                <TextInput
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="Enter amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
                />
                
                <TextInput
                  value={bankDetails.bank_account}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, bank_account: text }))}
                  placeholder="Bank Account Number"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
                />
                
                <TextInput
                  value={bankDetails.bank_name}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, bank_name: text }))}
                  placeholder="Bank Name"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
                />
                
                <TextInput
                  value={bankDetails.account_holder_name}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, account_holder_name: text }))}
                  placeholder="Account Holder Name"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
                />
                
                <TextInput
                  value={bankDetails.iban}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text }))}
                  placeholder="IBAN (Optional)"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-base text-gray-900"
                />
                
                <View className="flex-row space-x-3 mb-4">
                  <Pressable 
                    onPress={() => setShowWithdrawModal(false)}
                    className="flex-1 bg-gray-200 p-3 rounded-lg"
                  >
                    <Text className="text-gray-800 text-center font-medium">Cancel</Text>
                  </Pressable>
                  <Pressable 
                    onPress={handleWithdrawalRequest}
                    className="flex-1 bg-green-600 p-3 rounded-lg"
                  >
                    <Text className="text-white text-center font-medium">Submit</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}
