// context/CaptainAuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { createContext, useEffect, useState } from 'react';

export const CaptainAuthContext = createContext();

export const CaptainAuthProvider = ({ children }) => {
  const [isCaptainVerified, setIsCaptainVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  useEffect(() => {
    let isMounted = true;               // avoids set‑state on unmounted component

    const verifyCaptain = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          redirectToLogin();
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/captain/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const captain = response.data;

        if (captain /*&& captain.captain_status === 'Active'*/) {
          if (isMounted) setIsCaptainVerified(true);
        } else {
          redirectToLogin();
        }
      } catch (err) {
        console.error('Captain verification error:', err);
        redirectToLogin();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyCaptain();

    return () => {
      isMounted = false;               // cleanup flag
    };
  }, []); 

  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('token');
    router.push('/captain/login');
  };

  return (
    <CaptainAuthContext.Provider value={{ isCaptainVerified, loading }}>
      {children}
    </CaptainAuthContext.Provider>
  );
};
