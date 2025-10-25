import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState } from 'react';

const HomeContext = createContext();

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};

export const HomeProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
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

  // Fetch active vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Use /api/vendor/all to get all vendors (including pending ones)
      // This matches what the browse stores page uses
      const response = await axios.get(`${BACKEND_URL}/api/vendor/all`, { headers });
      
      if (response.data && response.data.vendors && Array.isArray(response.data.vendors)) {
        // Transform the data to match expected structure
        const transformedVendors = response.data.vendors.map(vendor => ({
          id: vendor.id,
          phone_number: vendor.phone_number,
          name: vendor.name,
          email: vendor.email,
          shop_name: vendor.vendor_info?.shop_name || vendor.name,
          shop_location: vendor.vendor_info?.shop_location || 'Location not specified',
          logo: vendor.vendor_info?.logo,
          vendor_status: vendor.vendor_status,
          // Include other vendor_info fields
          ...vendor.vendor_info
        }));
        setVendors(transformedVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BACKEND_URL}/api/vendor/categories`, { headers });
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't set error for categories since we have fallback defaults
      console.log('Using default categories due to API error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured products (products from multiple vendors)
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Get a few active vendors first
      const vendorsResponse = await axios.get(`${BACKEND_URL}/api/vendor/active`, { headers });
      const activeVendors = vendorsResponse.data || [];
      
      // Get products from first few vendors
      const productsPromises = activeVendors.slice(0, 3).map(async (vendor) => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${vendor.phone_number}`, { headers });
          return response.data.products || [];
        } catch (error) {
          console.error(`Error fetching products for vendor ${vendor.phone_number}:`, error);
          return [];
        }
      });
      
      const allProducts = await Promise.all(productsPromises);
      const flatProducts = allProducts.flat();
      
      // Filter and sort products (featured products with good ratings, in stock, etc.)
      const featured = flatProducts
        .filter(product => product.status === 'active' && product.stock > 0)
        .sort((a, b) => b.price - a.price) // Sort by price descending for "best deals"
        .slice(0, 6); // Take top 6 products
      
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch featured products');
    } finally {
      setLoading(false);
    }
  };

  // Get vendor with products by phone number
  const getVendorWithProducts = async (phoneNumber) => {
    try {
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BACKEND_URL}/api/vendor/profile-with-products/${phoneNumber}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor with products:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    try {
      // Run all fetch operations in parallel, but handle errors individually
      await Promise.allSettled([
        fetchVendors(),
        fetchCategories(),
        fetchFeaturedProducts()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Individual functions handle their own errors
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load data when user becomes authenticated
  const loadDataWhenAuthenticated = async () => {
    const token = await getAuthToken();
    if (token) {
      await refreshData();
    }
  };

  // Load data on mount only if user is authenticated
  useEffect(() => {
    const loadHomeData = async () => {
      const token = await getAuthToken();
      if (token) {
        refreshData();
      }
    };
    loadHomeData();
  }, []);

  const value = {
    vendors,
    categories,
    featuredProducts,
    loading,
    error,
    fetchVendors,
    fetchCategories,
    fetchFeaturedProducts,
    getVendorWithProducts,
    refreshData,
    clearError,
    loadDataWhenAuthenticated,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};
