import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Alert, 
  ActivityIndicator,
  TextInput,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CartContext } from '../../context/customer/CartContext';
import { useWallet } from '../../context/customer/WalletContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function CheckoutScreen() {
  const cartContext = useContext(CartContext);
  const { wallet, payWithWallet, getWalletInfo, refreshWalletData } = useWallet();
  const { t, isRTL } = useLanguage();
  
  // Safety checks to prevent undefined errors
  if (!cartContext) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">{t('common.loading')}</Text>
      </View>
    );
  }
  
  const { cartItems = [], total = 0, clearCart, vendorId, getCartItems } = cartContext;
  
  // Ensure cartItems is always an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  
  // Debug cart items
  console.log('Cart items in checkout:', safeCartItems);
  console.log('Cart total:', total);
  console.log('Cart items length:', safeCartItems?.length);

  // Refresh cart and wallet data once when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const refreshData = async () => {
      console.log('Checkout component mounted, refreshing cart and wallet data...');
      if (getCartItems && isMounted) {
        try {
          await getCartItems();
        } catch (error) {
          console.error('Error refreshing cart data:', error);
        }
      }
      if (refreshWalletData && isMounted) {
        try {
          await refreshWalletData(true); // Force refresh on checkout page mount
        } catch (error) {
          console.error('Error refreshing wallet data:', error);
        }
      }
    };
    
    refreshData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const forceRefresh = async () => {
    console.log('Forcing checkout page refresh...');
    setRefreshKey(prev => prev + 1);
    if (getCartItems) {
      try {
        await getCartItems();
      } catch (error) {
        console.error('Error in force refresh cart:', error);
      }
    }
    if (refreshWalletData) {
      try {
        await refreshWalletData(true); // Force refresh when user clicks refresh button
      } catch (error) {
        console.error('Error in force refresh wallet:', error);
      }
    }
  };

  // Removed debug logging to prevent console spam
  
  // Removed cart check useEffect to prevent redirect issues

  // Removed wallet refresh useEffect to prevent infinite loops

  // Removed useFocusEffect to prevent infinite loops
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  // Hardcoded Libyan cities with delivery fees (in USD)
  const libyanCities = [
    { name: 'Tripoli', delivery_fee: 3.00, delivery_time: 30, min_order_amount: 10.00 },
    { name: 'Benghazi', delivery_fee: 4.00, delivery_time: 45, min_order_amount: 12.00 },
    { name: 'Misrata', delivery_fee: 3.50, delivery_time: 40, min_order_amount: 11.00 },
    { name: 'Zawiya', delivery_fee: 2.50, delivery_time: 25, min_order_amount: 8.00 },
    { name: 'Sabratha', delivery_fee: 5.00, delivery_time: 50, min_order_amount: 14.00 },
    { name: 'Zliten', delivery_fee: 4.50, delivery_time: 45, min_order_amount: 13.00 },
    { name: 'Khoms', delivery_fee: 4.00, delivery_time: 40, min_order_amount: 12.00 },
    { name: 'Tarhuna', delivery_fee: 5.50, delivery_time: 55, min_order_amount: 15.00 },
    { name: 'Sirte', delivery_fee: 7.00, delivery_time: 60, min_order_amount: 16.00 },
    { name: 'Derna', delivery_fee: 8.00, delivery_time: 70, min_order_amount: 18.00 },
    { name: 'Tobruk', delivery_fee: 9.00, delivery_time: 75, min_order_amount: 20.00 },
    { name: 'Al Bayda', delivery_fee: 7.50, delivery_time: 65, min_order_amount: 17.00 }
  ];

  const [selectedCity, setSelectedCity] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [showCityModal, setShowCityModal] = useState(false);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setDeliveryFee(city.delivery_fee);
    setShippingAddress(prev => ({ ...prev, city: city.name }));
    
    // Update order summary with new delivery fee
    setOrderSummary(prev => ({
      ...prev,
      deliveryFee: city.delivery_fee,
      total: prev.subtotal + city.delivery_fee
    }));
  };

  // Fetch customer data from backend
  useEffect(() => {
    let isMounted = true;
    
    const fetchCustomerData = async () => {
      try {
        if (isMounted) setLoadingCustomerData(true);
        
        const token = await AsyncStorage.getItem('token');
        console.log('Token found:', token ? 'Yes' : 'No');
        
        if (token && isMounted) {
          const response = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Customer profile response:', response.data);
          
          if (response.data && isMounted) {
            const userData = response.data;
            setShippingAddress(prev => ({
              ...prev,
              name: userData.name || '',
              phone: userData.phone_number || '',
              address: '', // Keep address empty for user to fill
              notes: '' // Keep notes empty for user to fill
            }));
            console.log('Customer data loaded:', userData.name, userData.phone_number);
          }
        }
      } catch (error) {
        console.log('Error fetching customer data:', error);
        console.log('Error response:', error.response?.data);
        console.log('Error status:', error.response?.status);
        
        // If error, keep fields empty for user to fill
        if (isMounted) {
          setShippingAddress(prev => ({
            ...prev,
            name: '',
            phone: '',
            address: '',
            notes: ''
          }));
        }
      } finally {
        if (isMounted) setLoadingCustomerData(false);
      }
    };

    fetchCustomerData();
    
    return () => {
      isMounted = false;
    };
  }, []);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryFee: 3.00,
    total: 0
  });

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    // Calculate order summary
    const subtotal = total;
    const currentDeliveryFee = selectedCity ? selectedCity.delivery_fee : 3.00; // Default to Tripoli fee
    const totalAmount = subtotal + currentDeliveryFee;
    
    setOrderSummary({
      subtotal,
      deliveryFee: currentDeliveryFee,
      total: totalAmount
    });
  }, [total, selectedCity]);

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
    if (!shippingAddress.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    // Check if cart has items
    if (!safeCartItems || safeCartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checkout.');
      router.push('/customer/shop/cart');
      return;
    }

    if (!validateForm()) return;

    if (selectedPaymentMethod === 'wallet') {
      // Check wallet balance
      if (!wallet || wallet.balance < orderSummary.total) {
        Alert.alert(
          'Insufficient Balance',
          `Your wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}) is insufficient for this order ($${orderSummary.total.toFixed(2)}). Please top up your wallet.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Top Up Wallet', onPress: () => router.push('/customer/wallet') }
          ]
        );
        return;
      }

      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Please log in to place an order');
          return;
        }

        // Create order first
        const orderData = {
          items: (safeCartItems || []).map(item => ({
            product_id: item?.id,
            quantity: item?.quantity || 1
          })),
          address: `${shippingAddress.address}, ${shippingAddress.city}, Libya`,
          payment_method: selectedPaymentMethod
        };

        const orderResponse = await axios.post(
          `${BACKEND_URL}/api/customers/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Order response:', orderResponse.data);
        console.log('Order response structure:', JSON.stringify(orderResponse.data, null, 2));

        // The backend returns the order directly, so orderResponse.data should be the order
        const orderId = orderResponse.data.id;

        if (orderId) {
          // Process wallet payment
          const paymentResult = await payWithWallet(
            orderId,
            orderSummary.total,
            `Payment for Order #${orderId}`
          );

          if (paymentResult.success) {
            // Store cart info before clearing
            const cartItemCount = safeCartItems.length;
            
            // Clear cart
            clearCart();
            
            // Show success modal
            setOrderDetails({
              orderId: orderId,
              total: orderSummary.total,
              items: cartItemCount
            });
            setShowSuccessModal(true);
            
            console.log('Order placed successfully:', orderId);
            console.log('Payment processed:', paymentResult);
            console.log('Cart cleared, items were:', cartItemCount);
            console.log('Success modal should be showing now');
          } else {
            console.log('Payment failed:', paymentResult.error);
            Alert.alert('Payment Failed', paymentResult.error || 'Payment could not be processed');
          }
        } else {
          console.log('No order ID found in response:', orderResponse.data);
          Alert.alert('Error', 'Failed to create order - No order ID returned');
        }
      } catch (error) {
        console.error('Order placement error:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to place order';
        Alert.alert('Order Failed', errorMsg);
      } finally {
        setLoading(false);
      }
    } else if (selectedPaymentMethod === 'cash') {
      // Handle cash on delivery
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Please log in to place an order');
          return;
        }

        // Create order for cash payment
        const orderData = {
          items: (safeCartItems || []).map(item => ({
            product_id: item?.id,
            quantity: item?.quantity || 1
          })),
          address: `${shippingAddress.address}, ${shippingAddress.city}, Libya`,
          payment_method: selectedPaymentMethod
        };

        const orderResponse = await axios.post(
          `${BACKEND_URL}/api/customers/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Cash order response:', orderResponse.data);

        if (orderResponse.data) {
          // Clear cart
          clearCart();
          
          // Set order details for success modal
          setOrderDetails({
            orderNumber: orderResponse.data.id || 'N/A',
            total: orderSummary.total,
            paymentMethod: selectedPaymentMethod
          });
          
          // Show success modal
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error('Error placing cash order:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to place order';
        Alert.alert('Order Failed', errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderCartItem = ({ item }) => {
    console.log('Rendering cart item:', item);
    if (!item) return null;
    
    return (
      <View className="flex-row items-center bg-white p-3 rounded-lg mb-2 border border-gray-100">
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
          className="w-12 h-12 rounded-lg mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>{item.name || 'Product'}</Text>
          <Text className="text-sm text-gray-500">Qty: {item.quantity || 1}</Text>
        </View>
        <Text className="font-bold text-primary">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-900">{t('checkout.title')}</Text>
          </View>
          <Pressable onPress={forceRefresh} className="p-2">
            <Ionicons name="refresh" size={20} color="#007233" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">{t('checkout.shippingAddress')}</Text>
          </View>
          
          <View className="space-y-3">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.fullName')}</Text>
              {loadingCustomerData ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center">
                  <ActivityIndicator size="small" color="#007233" />
                  <Text className="text-gray-500 ml-2">{t('checkout.loadingName')}</Text>
                </View>
              ) : (
                <TextInput
                  value={shippingAddress.name}
                  onChangeText={(text) => setShippingAddress(prev => ({ ...prev, name: text }))}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
                  placeholder={t('checkout.enterFullName')}
                />
              )}
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.phoneNumber')}</Text>
              {loadingCustomerData ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center">
                  <ActivityIndicator size="small" color="#007233" />
                  <Text className="text-gray-500 ml-2">{t('checkout.loadingPhone')}</Text>
                </View>
              ) : (
                <TextInput
                  value={shippingAddress.phone}
                  onChangeText={(text) => setShippingAddress(prev => ({ ...prev, phone: text }))}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
                  placeholder={t('checkout.enterPhoneNumber')}
                  keyboardType="phone-pad"
                />
              )}
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">{t('checkout.address')}</Text>
              <TextInput
                value={shippingAddress.address}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, address: text }))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
                placeholder={t('checkout.enterAddress')}
                multiline
                numberOfLines={2}
              />
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">City</Text>
              <Pressable
                onPress={() => setShowCityModal(true)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className={`${selectedCity ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedCity ? selectedCity.name : 'Select your city'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Pressable>
              {selectedCity && (
                <View className="mt-2 p-2 bg-green-50 rounded-lg">
                  <Text className="text-sm text-green-800">
                    Delivery Fee: ${selectedCity.delivery_fee} • {selectedCity.delivery_time} min
                  </Text>
                  {selectedCity.min_order_amount && (
                    <Text className="text-xs text-green-600 mt-1">
                      Min order: ${selectedCity.min_order_amount}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Country</Text>
              <View className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-3">
                <Text className="text-gray-600">Libya</Text>
              </View>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</Text>
              <TextInput
                value={shippingAddress.notes}
                onChangeText={(text) => setShippingAddress(prev => ({ ...prev, notes: text }))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900"
                placeholder="Any special delivery instructions"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        {/* Order Summary Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="receipt-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Order Summary</Text>
          </View>
          
          <FlatList
            data={safeCartItems || []}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
            className="mb-4"
          />
          
          <View className="border-t border-gray-200 pt-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">${orderSummary.deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-primary">${orderSummary.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="card-outline" size={20} color="#007233" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Payment Method</Text>
          </View>
          
          {/* Wallet Payment */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('wallet')}
            className={`p-4 rounded-xl border-2 mb-3 ${selectedPaymentMethod === 'wallet' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                  <Ionicons name="wallet" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Pay with Wallet</Text>
                  <Text className="text-sm text-gray-500">
                    Balance: EGP {wallet?.balance?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>
              <View className={`w-5 h-5 rounded-full border-2 ${selectedPaymentMethod === 'wallet' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                {selectedPaymentMethod === 'wallet' && (
                  <View className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </View>
            </View>
          </Pressable>

          {/* Cash on Delivery */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('cash')}
            className={`p-4 rounded-xl border-2 mb-3 ${selectedPaymentMethod === 'cash' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}
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
              <View className={`w-5 h-5 rounded-full border-2 ${selectedPaymentMethod === 'cash' ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}>
                {selectedPaymentMethod === 'cash' && (
                  <View className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </View>
            </View>
          </Pressable>

          {/* Card Payment */}
          <Pressable
            onPress={() => handlePaymentMethodSelect('card')}
            className={`p-4 rounded-xl border-2 ${selectedPaymentMethod === 'card' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}
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
              <View className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100">
                {selectedPaymentMethod === 'card' && (
                  <View className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </View>
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
                Place Order - ${orderSummary.total.toFixed(2)}
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
            
            <ScrollView className="max-h-64">
              {libyanCities.map((city, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    handleCitySelect(city);
                    setShowCityModal(false);
                  }}
                  className={`p-4 rounded-lg mb-2 ${
                    selectedCity?.name === city.name ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50'
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className={`font-semibold ${
                        selectedCity?.name === city.name ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {city.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        ${city.delivery_fee} • {city.delivery_time} min
                      </Text>
                      {city.min_order_amount && (
                        <Text className="text-xs text-gray-500">
                          Min order: ${city.min_order_amount}
                        </Text>
                      )}
                    </View>
                    {selectedCity?.name === city.name && (
                      <Ionicons name="checkmark-circle" size={20} color="#007233" />
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
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
              <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</Text>
              <Text className="text-gray-600 text-center">
                {orderDetails?.paymentMethod === 'cash' 
                  ? `Your order #${orderDetails?.orderNumber || orderDetails?.orderId} has been placed. Please have cash ready for delivery.`
                  : `Your order #${orderDetails?.orderId} has been placed and payment has been processed.`
                }
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
                className="bg-white border-2 border-primary py-4 rounded-xl"
              >
                <Text className="text-center text-primary font-bold text-lg">Continue Shopping</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
