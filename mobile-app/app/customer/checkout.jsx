import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { CartContext } from '../../context/customer/CartContext';
import { useWallet } from '../../context/customer/WalletContext';
import { useLanguage } from '../../context/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function CheckoutScreen() {
  const cartContext = useContext(CartContext);
  const { wallet, payWithWallet, refreshWalletData } = useWallet();
  const { t } = useLanguage();

  if (!cartContext) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">{t('common.loading')}</Text>
      </View>
    );
  }

  const { cartItems = [], total = 0, clearCart, getCartItems } = cartContext;
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // ─────────────────────────────────────────────
  //  State
  // ─────────────────────────────────────────────

  const [loading, setLoading] = useState(false);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingServiceFee, setLoadingServiceFee] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [selectedZone, setSelectedZone] = useState(null);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [serviceFee, setServiceFee] = useState(null); // { fee_type, value }

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    serviceFeeAmount: 0,
    total: 0,
  });

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch {
      return null;
    }
  };

  /**
   * Calculate service fee amount based on fee_type
   * 'percentage' → value% of subtotal
   * 'fixed'      → flat value amount
   */
  const calculateServiceFeeAmount = (subtotal, fee) => {
    if (!fee || !fee.is_active) return 0;
    if (fee.fee_type === 'percentage') {
      return parseFloat(((subtotal * parseFloat(fee.value)) / 100).toFixed(2));
    }
    return parseFloat(fee.value);
  };

  // ─────────────────────────────────────────────
  //  Fetch delivery zones from backend
  // ─────────────────────────────────────────────

  const fetchDeliveryZones = async () => {
    try {
      setLoadingZones(true);
      const token = await getAuthToken();

      const response = await axios.get(`${BACKEND_URL}/api/deliveryZone`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept both { data: [...] } and plain array responses
      const zones = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Only show active zones
      setDeliveryZones(zones.filter((z) => z.is_active));
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      Alert.alert('Error', 'Failed to load delivery zones. Please try again.');
    } finally {
      setLoadingZones(false);
    }
  };

  // ─────────────────────────────────────────────
  //  Fetch active service fee from backend
  // ─────────────────────────────────────────────

  const fetchServiceFee = async () => {
    try {
      setLoadingServiceFee(true);
      const token = await getAuthToken();

      const response = await axios.get(`${BACKEND_URL}/api/serviceFee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept both { data: {...} } and plain object responses
      // Take the first active fee if array is returned
      const feeData = Array.isArray(response.data)
        ? response.data.find((f) => f.is_active) || null
        : response.data?.data || response.data || null;

      setServiceFee(feeData);
    } catch (error) {
      console.error('Error fetching service fee:', error);
      // Non-fatal — order can still proceed without service fee
      setServiceFee(null);
    } finally {
      setLoadingServiceFee(false);
    }
  };

  // ─────────────────────────────────────────────
  //  Fetch customer profile
  // ─────────────────────────────────────────────

  const fetchCustomerData = async () => {
    try {
      setLoadingCustomerData(true);
      const token = await getAuthToken();

      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setShippingAddress((prev) => ({
          ...prev,
          name: response.data.name || '',
          phone: response.data.phone_number || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoadingCustomerData(false);
    }
  };

  // ─────────────────────────────────────────────
  //  Mount: load all data once
  // ─────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      await Promise.all([
        getCartItems?.(),
        refreshWalletData?.(true),
        fetchDeliveryZones(),
        fetchServiceFee(),
        fetchCustomerData(),
      ]);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─────────────────────────────────────────────
  //  Recalculate order summary whenever deps change
  // ─────────────────────────────────────────────

  useEffect(() => {
    const subtotal = total;
    const deliveryFee = selectedZone ? parseFloat(selectedZone.base_delivery_fee) : 0;
    const serviceFeeAmount = calculateServiceFeeAmount(subtotal, serviceFee);
    const orderTotal = subtotal + deliveryFee + serviceFeeAmount;

    setOrderSummary({
      subtotal,
      deliveryFee,
      serviceFeeAmount,
      total: orderTotal,
    });
  }, [total, selectedZone, serviceFee]);

  // ─────────────────────────────────────────────
  //  Zone selection
  // ─────────────────────────────────────────────

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setShippingAddress((prev) => ({ ...prev, city: zone.city_name }));
    setShowCityModal(false);
  };

  // ─────────────────────────────────────────────
  //  Payment method
  // ─────────────────────────────────────────────

  const handlePaymentMethodSelect = (method) => {
    if (method === 'card') {
      Alert.alert(
        'Coming Soon',
        'Card payment is not available yet. Please use wallet or cash on delivery.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedPaymentMethod(method);
  };

  // ─────────────────────────────────────────────
  //  Validation
  // ─────────────────────────────────────────────

  const validateForm = () => {
    if (!shippingAddress.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!shippingAddress.address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!selectedZone) {
      Alert.alert('Error', 'Please select your city');
      return false;
    }
    return true;
  };

  // ─────────────────────────────────────────────
  //  Place order
  // ─────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!safeCartItems || safeCartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checkout.');
      router.push('/customer/shop/cart');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please log in to place an order');
        return;
      }

      const orderData = {
        items: safeCartItems.map((item) => ({
          product_id: item?.id,
          quantity: item?.quantity || 1,
        })),
        address: `${shippingAddress.address}, ${selectedZone.city_name}, Libya`,
        payment_method: selectedPaymentMethod,
        delivery_zone_id: selectedZone.id,
        delivery_fee: orderSummary.deliveryFee,
        service_fee: orderSummary.serviceFeeAmount,
        notes: shippingAddress.notes || null,
      };

      if (selectedPaymentMethod === 'wallet') {
        // Check wallet balance
        if (!wallet || wallet.balance < orderSummary.total) {
          Alert.alert(
            'Insufficient Balance',
            `Your wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}) is insufficient for this order ($${orderSummary.total.toFixed(2)}). Please top up your wallet.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Top Up Wallet', onPress: () => router.push('/customer/wallet') },
            ]
          );
          return;
        }

        const orderResponse = await axios.post(
          `${BACKEND_URL}/api/customers/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const orderId = orderResponse.data?.id;

        if (!orderId) {
          Alert.alert('Error', 'Failed to create order — no order ID returned');
          return;
        }

        const paymentResult = await payWithWallet(
          orderId,
          orderSummary.total,
          `Payment for Order #${orderId}`
        );

        if (paymentResult?.success) {
          clearCart();
          setOrderDetails({
            orderId,
            total: orderSummary.total,
            items: safeCartItems.length,
            paymentMethod: 'wallet',
          });
          setShowSuccessModal(true);
        } else {
          Alert.alert('Payment Failed', paymentResult?.error || 'Payment could not be processed');
        }
      } else if (selectedPaymentMethod === 'cash') {
        const orderResponse = await axios.post(
          `${BACKEND_URL}/api/customers/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (orderResponse.data) {
          clearCart();
          setOrderDetails({
            orderId: orderResponse.data.id,
            total: orderSummary.total,
            items: safeCartItems.length,
            paymentMethod: 'cash',
          });
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Order Failed', error.response?.data?.error || error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  //  Render helpers
  // ─────────────────────────────────────────────

  const renderCartItem = ({ item }) => {
    if (!item) return null;
    return (
      <View className="flex-row items-center bg-white p-3 rounded-lg mb-2 border border-gray-100">
        <Image
          source={{
            uri:
              item.image ||
              'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
          }}
          className="w-12 h-12 rounded-lg mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {item.name || 'Product'}
          </Text>
          <Text className="text-sm text-gray-500">Qty: {item.quantity || 1}</Text>
        </View>
        <Text className="font-bold text-primary">
          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
        </Text>
      </View>
    );
  };

  const isPageLoading = loadingZones || loadingServiceFee;

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────

  if (isPageLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="text-gray-500 mt-3">Loading checkout...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }} edges={['top']}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">{t('checkout.title')}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled" 
      >

        {/* Shipping Address */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              {t('checkout.shippingAddress')}
            </Text>
          </View>

          {/* Name */}
          <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.fullName')}</Text>
          {loadingCustomerData ? (
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center mb-3">
              <ActivityIndicator size="small" color="#007233" />
              <Text className="text-gray-500 ml-2">{t('checkout.loadingName')}</Text>
            </View>
          ) : (
            <TextInput
              value={shippingAddress.name}
              onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, name: text }))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 mb-3"
              placeholder={t('checkout.enterFullName')}
            />
          )}

          {/* Phone */}
          <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.phoneNumber')}</Text>
          {loadingCustomerData ? (
            <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center mb-3">
              <ActivityIndicator size="small" color="#007233" />
              <Text className="text-gray-500 ml-2">{t('checkout.loadingPhone')}</Text>
            </View>
          ) : (
            <TextInput
              value={shippingAddress.phone}
              onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, phone: text }))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 mb-3"
              placeholder={t('checkout.enterPhoneNumber')}
              keyboardType="phone-pad"
            />
          )}

          {/* Address */}
          <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.address')}</Text>
          <TextInput
            value={shippingAddress.address}
            onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, address: text }))}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 mb-3"
            placeholder={t('checkout.enterAddress')}
            multiline
            numberOfLines={2}
          />

          {/* City / Delivery Zone */}
          <Text className="text-sm font-medium text-gray-700 mb-1">City</Text>
          <Pressable
            onPress={() => setShowCityModal(true)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center justify-between mb-1"
          >
            <Text className={selectedZone ? 'text-gray-900' : 'text-gray-500'}>
              {selectedZone ? selectedZone.city_name : 'Select your city'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Pressable>

          {selectedZone && (
            <View className="mt-1 mb-3 p-2 bg-green-50 rounded-lg">
              <Text className="text-sm text-green-800">
                Delivery Fee: ${parseFloat(selectedZone.base_delivery_fee).toFixed(2)}
                {selectedZone.zone_name ? ` • ${selectedZone.zone_name}` : ''}
              </Text>
              {selectedZone.description ? (
                <Text className="text-xs text-green-600 mt-1">{selectedZone.description}</Text>
              ) : null}
            </View>
          )}

          {/* Country */}
          <Text className="text-sm font-medium text-gray-700 mb-1">Country</Text>
          <View className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-3 mb-3">
            <Text className="text-gray-600">Libya</Text>
          </View>

          {/* Notes */}
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Delivery Notes (Optional)
          </Text>
          <TextInput
            value={shippingAddress.notes}
            onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, notes: text }))}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
            placeholder="Any special delivery instructions"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Order Summary */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="receipt-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Order Summary</Text>
          </View>

          <FlatList
            data={safeCartItems}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
            className="mb-4"
          />

          <View className="border-t border-gray-200 pt-3">
            {/* Subtotal */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</Text>
            </View>

            {/* Delivery Fee */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                {selectedZone
                  ? `$${orderSummary.deliveryFee.toFixed(2)}`
                  : 'Select a city'}
              </Text>
            </View>

            {/* Service Fee — only shown if active */}
            {serviceFee && serviceFee.is_active && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">
                  Service Fee{' '}
                  {serviceFee.fee_type === 'percentage'
                    ? `(${parseFloat(serviceFee.value)}%)`
                    : '(Fixed)'}
                </Text>
                <Text className="text-gray-900">
                  ${orderSummary.serviceFeeAmount.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Total */}
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-primary">
                ${orderSummary.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="card-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Payment Method</Text>
          </View>

          {/* Wallet */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('wallet')}
            className={`p-4 rounded-xl border-2 mb-3 ${
              selectedPaymentMethod === 'wallet'
                ? 'border-primary bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                  <Ionicons name="wallet" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Pay with Wallet</Text>
                  <Text className="text-sm text-gray-500">
                    Balance: ${wallet?.balance?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedPaymentMethod === 'wallet' ? 'border-primary bg-primary' : 'border-gray-300'
                }`}
              >
                {selectedPaymentMethod === 'wallet' && (
                  <View className="w-2 h-2 bg-white rounded-full" />
                )}
              </View>
            </View>
          </Pressable>

          {/* Cash on Delivery */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('cash')}
            className={`p-4 rounded-xl border-2 mb-3 ${
              selectedPaymentMethod === 'cash'
                ? 'border-primary bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3">
                  <Ionicons name="cash" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-700">Cash on Delivery</Text>
                  <Text className="text-sm text-gray-500">Pay when your order arrives</Text>
                </View>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedPaymentMethod === 'cash' ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}
              >
                {selectedPaymentMethod === 'cash' && (
                  <View className="w-2 h-2 bg-white rounded-full" />
                )}
              </View>
            </View>
          </Pressable>

          {/* Card — coming soon */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('card')}
            className="p-4 rounded-xl border-2 border-gray-200 bg-white"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-400 rounded-full items-center justify-center mr-3">
                  <Ionicons name="card" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-500">Card Payment</Text>
                  <Text className="text-sm text-gray-400">Coming Soon</Text>
                </View>
              </View>
              <View className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100" />
            </View>
          </Pressable>
        </View>

        {/* Place Order Button */}
        <View className="mx-4 mt-6 mb-8">
          <Pressable
            onPress={handlePlaceOrder}
            disabled={loading}
            className={`bg-primary py-4 rounded-xl ${loading ? 'opacity-60' : ''}`}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
              </View>
            ) : (
              <Text className="text-center text-white font-bold text-lg">
                Place Order — ${orderSummary.total.toFixed(2)}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* City Selection Modal */}
      {showCityModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white mx-6 rounded-2xl p-6 w-11/12 max-w-md max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Select City</Text>
              <Pressable onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {deliveryZones.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="location-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No delivery zones available at the moment.
                </Text>
              </View>
            ) : (
              <ScrollView className="max-h-64">
                {deliveryZones.map((zone) => (
                  <Pressable
                    key={zone.id}
                    onPress={() => handleZoneSelect(zone)}
                    className={`p-4 rounded-lg mb-2 ${
                      selectedZone?.id === zone.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-50'
                    }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${
                            selectedZone?.id === zone.id ? 'text-primary' : 'text-gray-900'
                          }`}
                        >
                          {zone.city_name}
                        </Text>
                        {zone.zone_name ? (
                          <Text className="text-xs text-gray-500">{zone.zone_name}</Text>
                        ) : null}
                        <Text className="text-sm text-gray-600">
                          Delivery: ${parseFloat(zone.base_delivery_fee).toFixed(2)}
                        </Text>
                        {zone.description ? (
                          <Text className="text-xs text-gray-400 mt-0.5">{zone.description}</Text>
                        ) : null}
                      </View>
                      {selectedZone?.id === zone.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#007233" />
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white mx-6 rounded-2xl p-6 w-11/12 max-w-sm">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark" size={32} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Order Placed Successfully!
              </Text>
              <Text className="text-gray-600 text-center">
                {orderDetails?.paymentMethod === 'cash'
                  ? `Your order #${orderDetails?.orderId} has been placed. Please have cash ready for delivery.`
                  : `Your order #${orderDetails?.orderId} has been placed and payment has been processed.`}
              </Text>
            </View>

            <View className="bg-gray-50 rounded-lg p-4 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Order ID</Text>
                <Text className="font-semibold text-gray-900">#{orderDetails?.orderId}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Items</Text>
                <Text className="font-semibold text-gray-900">{orderDetails?.items} item(s)</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total</Text>
                <Text className="font-bold text-primary">${orderDetails?.total?.toFixed(2)}</Text>
              </View>
            </View>

            <View className="space-y-3">
              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/customer/orders');
                }}
                className="bg-primary py-4 rounded-xl"
              >
                <Text className="text-center text-white font-bold text-lg">View My Orders</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/customer/shop/shop');
                }}
                className="bg-white border-2 border-primary py-4 rounded-xl mt-3"
              >
                <Text className="text-center text-primary font-bold text-lg">
                  Continue Shopping
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
