


import { useLocalSearchParams } from 'expo-router';
import React, { useContext } from 'react';
import { Text } from 'react-native';
import EditProductScreen from '../../../components/vendor/screens/EditProductScreen';
import { VendorAuthContext } from '../../../context/VendorAuthContext';

export default function EditProductPage() {

    const context = useContext(VendorAuthContext);
    const { product } = useLocalSearchParams();

    if (!context) {
      console.warn("CaptainAuthContext is undefined —  you forget to wrap with the provider");
      return null;
    }
  
    const { isVendorVerified, loading } = context;
  
    if (loading) return <Text>Loading...</Text>;
    if (!isVendorVerified) return <Text>Redirecting...</Text>;
    if (!product) return <Text>No product data provided.</Text>;

    const parsedProduct = JSON.parse(product);
  
    return <EditProductScreen product={parsedProduct} />;
}

