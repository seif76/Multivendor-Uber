// context/CaptainAuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';

export const DeliverymanAuthContext = createContext();

export const DeliverymanAuthProvider = ({ children }) => {
  const [isDeliverymanVerified, setIsDeliverymanVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  useEffect(() => {
    let isMounted = true;               // avoids set‑state on unmounted component

    const verifyDeliveryman = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          redirectToLogin();
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/deliveryman/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const deliveryman = response.data;

        if (deliveryman /*&& deliveryman.deliveryman_status === 'Active'*/) {
          if (isMounted) setIsDeliverymanVerified(true);
        } else {
          redirectToLogin();
        }
      } catch (err) {
        console.error('Deliveryman verification error:', err);
        redirectToLogin();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyDeliveryman();

    return () => {
      isMounted = false;               // cleanup flag
    };
  }, []); 

  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('token');
    router.push('/deliveryMan/login');
  };

  return (
    <DeliverymanAuthContext.Provider value={{ isDeliverymanVerified, loading }}>
      {children}
    </DeliverymanAuthContext.Provider>
  );
};
