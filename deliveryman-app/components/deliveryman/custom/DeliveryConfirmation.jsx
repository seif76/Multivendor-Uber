// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
// // import { BACKEND_URL } from '../../../config/socket';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import Constants from 'expo-constants';

// const DeliveryConfirmation = ({ order, onStatusUpdate }) => {
//   const [currentStatus, setCurrentStatus] = useState(order.delivery_status || 'none');
//   const [updating, setUpdating] = useState(false);
//   const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  
//   // Sync currentStatus with order.delivery_status when it changes
//   useEffect(() => {
//     console.log('DeliveryConfirmation useEffect - order.delivery_status changed:', order.delivery_status);
//     setCurrentStatus(order.delivery_status || 'none');
//    // alert("order are :" + JSON.stringify(order));  
//   }, [order.delivery_status]);

//   // Debug logging for component renders
//   useEffect(() => {
//     console.log('DeliveryConfirmation rendered for order:', order.id, 'with status:', order.delivery_status);
//   }, [order.id, order.delivery_status]);
  

//   const statusConfig = {
//     none: { 
//       title: 'Ready to Start', 
//       color: 'bg-gray-500', 
//       nextAction: 'deliveryman_arrived',
//       nextButtonText: 'I Have Arrived',
//       description: 'Press when you arrive at the vendor location'
//     },
//     deliveryman_arrived: { 
//       title: 'Arrived at Vendor', 
//       color: 'bg-blue-500', 
//       nextAction: order.delivery_status === 'order_handed_over' ? 'order_received' : null, // Wait for vendor to hand over first
//       nextButtonText: order.delivery_status === 'order_handed_over' ? 'I Have the Order' : null,
//       description: 'Waiting for vendor to hand over the order'
//     },
//     order_handed_over: { 
//       title: 'Order Handed Over', 
//       color: 'bg-yellow-500', 
//       nextAction: 'order_received',
//       nextButtonText: 'I Have the Order',
//       description: 'Press when you confirm you have received the order'
//     },
//     order_received: { 
//       title: 'Order Received', 
//       color: 'bg-green-500', 
//       nextAction: order.payment_method === 'cash' ? 'payment_made' : null,
//       nextButtonText: order.payment_method === 'cash' ? 'Payment Made' : null,
//       description: order.payment_method === 'cash' 
//         ? 'Press when you have paid the vendor'
//         : 'Order received successfully - delivery completed'
//     },
//     payment_made: { 
//       title: 'Payment Made', 
//       color: 'bg-green-500', 
//       nextAction: 'payment_confirmed',
//       nextButtonText: 'Confirm Payment',
//       description: 'Waiting for vendor to confirm payment'
//     },
//     payment_confirmed: { 
//       title: 'Payment Confirmed', 
//       color: 'bg-green-600', 
//       nextAction: null,
//       nextButtonText: null,
//       description: 'Payment confirmed - delivery completed'
//     }
//   };

//   const handleStatusUpdate = async (newStatus) => {
//     if (updating) return;
    
//     setUpdating(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) throw new Error('Not authenticated');
//      // alert("newStatus: "+ newStatus + " order.id: "+ order.id);

//       const response = await axios.put(
//         `${BACKEND_URL}/api/deliveryman/orders/${order.id}/delivery-status`,
//         { status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("response: "+ JSON.stringify(response.data));

//       if (response.data.success) {
//         setCurrentStatus(newStatus);
//         onStatusUpdate && onStatusUpdate(newStatus);
        
//         const statusMessages = {
//           'deliveryman_arrived': 'You have arrived at the vendor location',
//           'order_handed_over': 'Order has been handed over to you',
//           'payment_received': 'Payment received from customer',
//           'payment_confirmed': 'Payment confirmed and delivery completed'
//         };
        
//         Alert.alert('Status Updated', statusMessages[newStatus] || 'Status updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating delivery status:'+ error.message);
//       Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const currentConfig = statusConfig[currentStatus];
//   const isCashPayment = order.payment_method === 'cash';
//   const showPaymentSteps = isCashPayment;
//   const showPaymentConfirmation = !isCashPayment && currentStatus !== 'payment_confirmed';

//   // Debug logging
//   console.log('DeliveryConfirmation render - Order ID:', order.id, 'Current Status:', currentStatus, 'Order Status:', order.delivery_status);

//   return (
//     <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//       <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Confirmation</Text>
      
//       {/* Order Info */}
//       <View className="mb-4 p-3 bg-gray-50 rounded-lg">
//         <Text className="text-sm font-semibold text-gray-700">Order #{order.id}</Text>
//         <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
//         <Text className="text-sm text-gray-600">Payment: {order.payment_method?.toUpperCase()}</Text>
//         <Text className="text-sm text-gray-600">Address: {order.address}</Text>
//       </View>

//       {/* Status Progress */}
//       <View className="mb-4">
//         <Text className="text-sm font-semibold text-gray-700 mb-2">Delivery Progress:</Text>
        
//         {/* Step 1: Arrived */}
//         <View className="flex-row items-center mb-2">
//           <View className={`w-6 h-6 rounded-full ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
//             <Text className="text-white text-xs text-center leading-6">1</Text>
//           </View>
//           <Text className={`text-sm ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
//             Arrived at Vendor
//           </Text>
//         </View>

//         {/* Step 2: Order Handed Over */}
//         <View className="flex-row items-center mb-2">
//           <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
//             <Text className="text-white text-xs text-center leading-6">2</Text>
//           </View>
//           <Text className={`text-sm ${currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
//             Order Handed Over
//           </Text>
//         </View>

//         {/* Step 3: Order Received */}
//         <View className="flex-row items-center mb-2">
//           <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
//             <Text className="text-white text-xs text-center leading-6">3</Text>
//           </View>
//           <Text className={`text-sm ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
//             Order Received
//           </Text>
//         </View>

//         {/* Step 4: Payment Made (Wallet only) */}
//         {isCashPayment && (
//           <View className="flex-row items-center mb-2">
//             <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
//               <Text className="text-white text-xs text-center leading-6">4</Text>
//             </View>
//             <Text className={`text-sm ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
//               Payment Made
//             </Text>
//           </View>
//         )}

//         {/* Step 5: Payment Confirmed (Wallet only) */}
//         {isCashPayment && (
//           <View className="flex-row items-center mb-2">
//             <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
//               <Text className="text-white text-xs text-center leading-6">5</Text>
//             </View>
//             <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
//               Payment Confirmed
//             </Text>
//           </View>
//         )}

//         {/* Final Step: Delivered */}
        
//       </View>

//       {/* Current Status */}
//       <View className={`p-3 rounded-lg mb-4 ${currentConfig.color}`}>
//         <Text className="text-white font-semibold text-center">{currentConfig.title}</Text>
//         <Text className="text-white text-sm text-center mt-1">{currentConfig.description}</Text>
//       </View>

//       {/* Action Button */}
//       {currentConfig.nextAction && (
//         <TouchableOpacity
//           onPress={() => handleStatusUpdate(currentConfig.nextAction)}
//           disabled={updating}
//           className={`${updating ? 'bg-gray-400' : 'bg-green-600'} py-3 px-4 rounded-lg`}
//         >
//           <Text className="text-white font-semibold text-center">
//             {updating ? 'Updating...' : currentConfig.nextButtonText}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {currentStatus === 'payment_confirmed' && (
//         <View className="bg-green-100 p-3 rounded-lg mt-2">
//           <Text className="text-green-800 font-semibold text-center">✅ Delivery Completed Successfully!</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default DeliveryConfirmation;



import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// ── Status flow config ──
// CASH:     none → deliveryman_arrived → [vendor] order_handed_over → order_received → payment_made → [vendor] payment_confirmed
// NON-CASH: none → deliveryman_arrived → [vendor] order_handed_over → order_received → DONE

const DELIVERYMAN_ACTIONS = {
  none: 'deliveryman_arrived',
  order_handed_over: 'order_received',   // only after vendor hands over
  order_received: 'payment_made',        // only for cash
};

const STATUS_STEPS_CASH = [
  { key: 'deliveryman_arrived', label: 'Arrived at Vendor' },
  { key: 'order_handed_over',   label: 'Order Handed Over' },
  { key: 'order_received',      label: 'Order Received' },
  { key: 'payment_made',        label: 'Payment Made' },
  { key: 'payment_confirmed',   label: 'Payment Confirmed' },
];

const STATUS_STEPS_NON_CASH = [
  { key: 'deliveryman_arrived', label: 'Arrived at Vendor' },
  { key: 'order_handed_over',   label: 'Order Handed Over' },
  { key: 'order_received',      label: 'Order Received' },
];

const STATUS_LABELS = {
  none:                 { title: 'Ready to Start',       description: 'Press when you arrive at the vendor location', color: '#6b7280' },
  deliveryman_arrived:  { title: 'Arrived at Vendor',    description: 'Waiting for vendor to hand over the order',    color: '#3b82f6' },
  order_handed_over:    { title: 'Order Handed Over',    description: 'Press to confirm you have received the order', color: '#f59e0b' },
  order_received:       { title: 'Order Received',       description: 'Press to confirm you have paid the vendor',    color: '#10b981' },
  payment_made:         { title: 'Payment Made',         description: 'Waiting for vendor to confirm payment',        color: '#10b981' },
  payment_confirmed:    { title: 'Payment Confirmed',    description: 'Delivery completed successfully',              color: '#16a34a' },
};

const BUTTON_LABELS = {
  none:             'I Have Arrived',
  order_handed_over: 'I Have the Order',
  order_received:   'Payment Made',
};

export default function DeliveryConfirmation({ order, onStatusUpdate }) {
  const [currentStatus, setCurrentStatus] = useState(order.delivery_status || 'none');
  const [updating, setUpdating] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const isCash = order.payment_method === 'cash';
  const steps = isCash ? STATUS_STEPS_CASH : STATUS_STEPS_NON_CASH;

  useEffect(() => {
    setCurrentStatus(order.delivery_status || 'none');
  }, [order.delivery_status]);

  // What action can deliveryman take from current status
  const getNextAction = () => {
    if (!isCash && currentStatus === 'order_received') return null; // non-cash ends here
    return DELIVERYMAN_ACTIONS[currentStatus] || null;
  };

  const nextAction = getNextAction();
  const currentStepIndex = steps.findIndex(s => s.key === currentStatus);
  const config = STATUS_LABELS[currentStatus] || STATUS_LABELS.none;
  const isCompleted =
    (isCash && currentStatus === 'payment_confirmed') ||
    (!isCash && currentStatus === 'order_received');

  const handleStatusUpdate = async () => {
    if (!nextAction || updating) return;
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${BACKEND_URL}/api/deliveryman/orders/${order.id}/delivery-status`,
        { status: nextAction },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCurrentStatus(nextAction);
        onStatusUpdate?.(nextAction);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Confirmation</Text>

      {/* Order Info */}
      <View className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700">Order #{order.id}</Text>
        <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
        <Text className="text-sm text-gray-600">Payment: {order.payment_method?.toUpperCase()}</Text>
        <Text className="text-sm text-gray-600">Address: {order.address}</Text>
      </View>

      {/* Progress Steps */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Delivery Progress:</Text>
        {steps.map((step, index) => {
          const reached = currentStepIndex >= index;
          const isVendorStep = step.key === 'order_handed_over' || step.key === 'payment_confirmed';
          return (
            <View key={step.key} className="flex-row items-center mb-2.5">
              {/* Step circle */}
              <View
                className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                  reached ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <Text className={`text-xs font-bold ${reached ? 'text-white' : 'text-gray-400'}`}>
                  {index + 1}
                </Text>
              </View>

              {/* Step label */}
              <View className="flex-1">
                <Text className={`text-sm ${reached ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </Text>
                {isVendorStep && (
                  <Text className="text-xs text-orange-500">Vendor action</Text>
                )}
              </View>

              {/* Check if reached */}
              {reached && (
                <Text className="text-green-500 text-base">✓</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Current Status Banner */}
      <View
        className="p-3 rounded-lg mb-4 items-center"
        style={{ backgroundColor: config.color }}
      >
        <Text className="text-white font-bold text-base">{config.title}</Text>
        <Text className="text-white text-xs mt-1 text-center">{config.description}</Text>
      </View>

      {/* Action Button — only show if deliveryman has an action */}
      {nextAction && !isCompleted && (
        <TouchableOpacity
          onPress={handleStatusUpdate}
          disabled={updating}
          className={`py-3 px-4 rounded-xl ${updating ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className="text-white font-bold text-center text-base">
            {updating ? 'Updating...' : BUTTON_LABELS[currentStatus]}
          </Text>
        </TouchableOpacity>
      )}

      {/* Waiting for vendor message */}
      {!nextAction && !isCompleted && (
        <View className="bg-orange-50 border border-orange-200 p-3 rounded-xl">
          <Text className="text-orange-700 font-semibold text-center text-sm">
            ⏳ Waiting for vendor action...
          </Text>
        </View>
      )}

      {/* Completed */}
      {isCompleted && (
        <View className="bg-green-50 border border-green-200 p-3 rounded-xl">
          <Text className="text-green-700 font-bold text-center">
            ✅ Delivery Completed Successfully!
          </Text>
        </View>
      )}
    </View>
  );
}