import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  // Get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Get wallet info
  const getWalletInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${BACKEND_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWallet(response.data.data.wallet);
        setTransactions(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch wallet info');
    } finally {
      setLoading(false);
    }
  };

  // Get wallet transactions
  const getWalletTransactions = async (page = 1, limit = 20, type = null) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({ page, limit });
      if (type) params.append('type', type);

      const response = await axios.get(`${BACKEND_URL}/api/wallet/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch transactions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mock top-up
  const mockTopUp = async (amount, description = 'Wallet top-up') => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${BACKEND_URL}/api/wallet/topup/mock`, {
        amount,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Refresh wallet info after successful top-up
        await getWalletInfo();
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Error with top-up:', error);
      setError(error.response?.data?.error || error.message || 'Top-up failed');
      return { success: false, error: error.response?.data?.error || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Pay with wallet
  const payWithWallet = async (orderId, amount, description = 'Order payment') => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${BACKEND_URL}/api/wallet/pay`, {
        order_id: orderId,
        amount,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Refresh wallet info after successful payment
        await getWalletInfo();
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Error with wallet payment:', error);
      setError(error.response?.data?.error || error.message || 'Payment failed');
      return { success: false, error: error.response?.data?.error || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Create withdrawal request
  const createWithdrawalRequest = async (amount, bankDetails) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${BACKEND_URL}/api/wallet/withdraw`, {
        amount,
        ...bankDetails,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      setError(error.response?.data?.error || error.message || 'Withdrawal request failed');
      return { success: false, error: error.response?.data?.error || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load wallet data when user becomes authenticated
  const loadWalletWhenAuthenticated = async () => {
    const token = await getAuthToken();
    if (token) {
      await getWalletInfo();
    }
  };

  // Load wallet info on mount only if user is authenticated
  useEffect(() => {
    const loadWalletData = async () => {
      const token = await getAuthToken();
      if (token) {
        getWalletInfo();
      }
    };
    loadWalletData();
  }, []);

  const value = {
    wallet,
    transactions,
    loading,
    error,
    getWalletInfo,
    getWalletTransactions,
    mockTopUp,
    payWithWallet,
    createWithdrawalRequest,
    clearError,
    loadWalletWhenAuthenticated,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
