import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';

export const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const [isCustomerVerified, setIsCustomerVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    let isMounted = true;
    const verifyCustomer = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          redirectToLogin();
          return;
        }
        const response = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const customer = response.data;
        if (customer) {
          if (isMounted) setIsCustomerVerified(true);
        } else {
          redirectToLogin();
        }
      } catch (err) {
        redirectToLogin();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    verifyCustomer();
    return () => {
      isMounted = false;
    };
  }, []);

  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('token');
    setIsCustomerVerified(false);
    router.push('/customer/login');
  };

  return (
    <CustomerAuthContext.Provider value={{ isCustomerVerified, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
