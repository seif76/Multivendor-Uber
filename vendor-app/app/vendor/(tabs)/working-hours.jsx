import React, { useContext } from 'react';
import { Text } from 'react-native';
import WorkingHoursManager from '../../../components/vendor/working-hours/WorkingHoursManager';
import { VendorAuthContext } from '../../../context/VendorAuthContext';

export default function VendorWorkingHoursPage() {
    const context = useContext(VendorAuthContext);

    if (!context) {
      console.warn("VendorAuthContext is undefined —  you forget to wrap with the provider");
      return null;
    }
  
    const { isVendorVerified, loading } = context;
  
    if (loading) return <Text>Loading...</Text>;
    if (!isVendorVerified) return <Text>Redirecting...</Text>;
  return <WorkingHoursManager />;
} 