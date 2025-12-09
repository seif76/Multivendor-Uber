import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const DeliverySocketContext = createContext();

export const DeliverySocketProvider = ({ children }) => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [deliverymanId, setDeliverymanId] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  
  const socketRef = useRef(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  // 1. Initialize Socket only once when the provider mounts
  useEffect(() => {
    let isMounted = true;

    const initConnection = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // Get Profile ID
        const profileRes = await axios.get(`${BACKEND_URL}/api/deliveryman/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!isMounted) return;
        
        const dId = profileRes.data.id;
        setDeliverymanId(dId);

        // Connect Socket
        socketRef.current = io(BACKEND_URL, {
          auth: { token: token },
          reconnection: true,
          reconnectionAttempts: 5
        });

        socketRef.current.on('connect', () => {
          console.log('✅ Global Deliveryman Socket Connected');
          setSocketConnected(true);
          socketRef.current.emit('deliverymanJoin', { deliverymanId: dId });
        });

        socketRef.current.on('disconnect', () => {
          console.log('❌ Global Deliveryman Socket Disconnected');
          setSocketConnected(false);
        });

        // --- LISTENERS ---

        // New Order Arrived
        socketRef.current.on('newDeliveryOrder', (data) => {
          console.log('🔔 New Order via Socket:', data.orderId);
          // Add to available orders if not exists
          setAvailableOrders(prev => {
            if (prev.find(o => o.id === data.orderId)) return prev;
            return [data.orderDetails, ...prev];
          });
        });

        // Delivery Status Update
        socketRef.current.on('deliveryStatusUpdate', ({ orderId, status }) => {
          console.log('🔄 Status Update:', orderId, status);
          setAcceptedOrders(prev => prev.map(o => 
            o.id === orderId ? { ...o, delivery_status: status } : o
          ));
        });

        // Fetch initial data immediately after connection setup
        await fetchInitialData();

      } catch (e) {
        console.error('Socket Init Error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initConnection();

    return () => {
      isMounted = false;
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Global Function to Accept Order
  const acceptOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.put(`${BACKEND_URL}/api/deliveryman/orders/${orderId}/accept`, 
        { deliverymanId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Move from Available to Accepted locally
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        setAcceptedOrders(prev => [res.data.order, ...prev]);
        return true;
      }
    } catch (error) {
      console.error('Accept Error:', error);
      Alert.alert('Error', 'Could not accept order.');
      return false;
    }
  };

  // 3. Global Function to Reject Order
  const rejectOrder = (orderId) => {
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // 4. Initial Fetch (Populates data from API logic provided)
  const fetchInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return; // Not authenticated

      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedOrders = res.data.orders || [];

      // Logic to split orders:
      // Since the API returns "My Orders" (likely history + active), we put them in acceptedOrders.
      // If your API had a status like "pending_acceptance", we would filter those into availableOrders.
      // For now, based on your previous file, these are treated as orders the deliveryman owns.
      setAcceptedOrders(fetchedOrders);
      
      // If you have a separate endpoint for "Available Requests", fetch it here:
      // const requests = await axios.get(...); 
      // setAvailableOrders(requests.data);

    } catch (err) {
      console.error('Error fetching initial orders:', err);
      // Optional: setError(err.message);
    }
  };

  return (
    <DeliverySocketContext.Provider value={{
      socket: socketRef.current,
      socketConnected,
      availableOrders,
      acceptedOrders,
      setAcceptedOrders, 
      acceptOrder,
      rejectOrder,
      fetchInitialData,
      loading // Exposed loading state
    }}>
      {children}
    </DeliverySocketContext.Provider>
  );
};

export const useDeliverySocket = () => useContext(DeliverySocketContext);