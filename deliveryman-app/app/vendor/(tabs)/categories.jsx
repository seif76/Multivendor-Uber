import React, { useContext } from 'react';
import CategoriesScreen from '../../../components/vendor/screens/CategoriesScreen';
import { VendorAuthContext } from '../../../context/VendorAuthContext';

export default function CategoriesPage() {

  const context = useContext(VendorAuthContext);

  if (!context) {
    console.warn("CaptainAuthContext is undefined —  you forget to wrap with the provider");
    return null;
  }

  const { isVendorVerified, loading } = context;

  if (loading) return <Text>Loading...</Text>;
  if (!isVendorVerified) return <Text>Redirecting...</Text>;
  return <CategoriesScreen />;
} 