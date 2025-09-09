import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Modal, 
  Pressable, 
  Text, 
  TextInput, 
  View 
} from 'react-native';
import { useWallet } from '../../../context/customer/WalletContext';

export default function WalletPaymentModal({ 
  visible, 
  onClose, 
  orderId, 
  orderAmount, 
  onPaymentSuccess 
}) {
  const { wallet, payWithWallet, loading } = useWallet();
  const [amount, setAmount] = useState(orderAmount?.toString() || '');
  const [description, setDescription] = useState('');

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(wallet?.balance || 0)) {
      Alert.alert('Error', 'Insufficient wallet balance');
      return;
    }

    const result = await payWithWallet(
      orderId, 
      parseFloat(amount), 
      description || `Payment for order #${orderId}`
    );

    if (result.success) {
      Alert.alert('Success', 'Payment completed successfully!');
      onPaymentSuccess?.(result.data);
      onClose();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '$0.00';
    return `$${parseFloat(balance).toFixed(2)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-6 pt-12 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-800">Pay with Wallet</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="flex-1 px-4 py-6">
          {/* Wallet Balance */}
          <View className="bg-green-50 p-4 rounded-lg mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-green-800 font-semibold">Available Balance</Text>
                <Text className="text-green-600 text-2xl font-bold">
                  {formatBalance(wallet?.balance)}
                </Text>
              </View>
              <View className="bg-green-200 p-3 rounded-full">
                <Ionicons name="wallet" size={24} color="#059669" />
              </View>
            </View>
          </View>

          {/* Order Info */}
          {orderId && (
            <View className="bg-gray-50 p-4 rounded-lg mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Order Details</Text>
              <Text className="text-gray-600">Order ID: #{orderId}</Text>
              <Text className="text-gray-600">Amount: ${parseFloat(amount || 0).toFixed(2)}</Text>
            </View>
          )}

          {/* Amount Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Payment Amount *</Text>
            <TextInput
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
            />
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
            <TextInput
              placeholder="Payment description"
              value={description}
              onChangeText={setDescription}
              className="border border-gray-300 rounded-lg px-4 py-3"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Payment Summary */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <Text className="text-blue-800 font-semibold mb-2">Payment Summary</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-blue-700">Amount to pay:</Text>
              <Text className="text-blue-700 font-semibold">${parseFloat(amount || 0).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-blue-700">Current balance:</Text>
              <Text className="text-blue-700 font-semibold">{formatBalance(wallet?.balance)}</Text>
            </View>
            <View className="border-t border-blue-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-blue-800 font-bold">Remaining balance:</Text>
                <Text className="text-blue-800 font-bold">
                  {formatBalance((parseFloat(wallet?.balance || 0) - parseFloat(amount || 0)))}
                </Text>
              </View>
            </View>
          </View>

          {/* Pay Button */}
          <Pressable 
            onPress={handlePayment}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className={`py-4 rounded-lg ${loading || !amount || parseFloat(amount) <= 0 ? 'bg-gray-400' : 'bg-primary'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">
                Pay ${parseFloat(amount || 0).toFixed(2)}
              </Text>
            )}
          </Pressable>

          {/* Insufficient Balance Warning */}
          {amount && parseFloat(amount) > parseFloat(wallet?.balance || 0) && (
            <View className="mt-4 bg-red-50 p-3 rounded-lg">
              <Text className="text-red-800 text-sm text-center">
                Insufficient balance. Please top up your wallet or reduce the amount.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
