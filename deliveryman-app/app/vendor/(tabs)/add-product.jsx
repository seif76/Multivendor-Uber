


import React, { useContext } from 'react';
import { Text } from 'react-native';
import AddProductScreen from '../../../components/vendor/screens/AddProductScreen';
import { VendorAuthContext } from '../../../context/VendorAuthContext';

export default function AddProductPage() {

    const context = useContext(VendorAuthContext);

    if (!context) {
      console.warn("CaptainAuthContext is undefined —  you forget to wrap with the provider");
      return null;
    }
  
    const { isVendorVerified, loading } = context;
  
    if (loading) return <Text>Loading...</Text>;
    if (!isVendorVerified) return <Text>Redirecting...</Text>;


  return (
    <AddProductScreen/>
  );
}

