import { Slot } from 'expo-router';
import FloatingCartButton from '../../../components/customer/custom/shop/FloatingCartButton';
import { View } from 'react-native';

export default function RootLayout() {
  return ( 
    <View>
      <Slot />
      <FloatingCartButton />
    </View>
  );
}
