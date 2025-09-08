// context/CaptainAuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';

export const VendorAuthContext = createContext();

export const VendorAuthProvider = ({ children }) => {
  const [isVendorVerified, setIsVendorVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  useEffect(() => {
    let isMounted = true;               // avoids set‑state on unmounted component

    const verifyVendor = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(token);
        if (!token) {
          redirectToLogin();
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/vendor/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const Vendor = response.data;

        if (Vendor /*&& vendor.vendor_status === 'Active'*/) {
          if (isMounted) setIsVendorVerified(true);
        } else {
          redirectToLogin();
        }
      } catch (err) {
        console.error('Vendor verification error:', err);
        redirectToLogin();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyVendor();

    return () => {
      isMounted = false;               // cleanup flag
    };
  }, []); 

  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('token');
    router.push('/vendor/login');
  };

  return (
    <VendorAuthContext.Provider value={{ isVendorVerified, loading }}>
      {children}
    </VendorAuthContext.Provider>
  );
};
