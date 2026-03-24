import { Slot } from 'expo-router';
import FloatingCartButton from '../../../components/customer/custom/shop/FloatingCartButton';
import { View } from 'react-native';
import { SafeAreaProvider  , SafeAreaView} from 'react-native-safe-area-context';

export default function RootLayout() {
  return ( 
    <View>
      <SafeAreaView>
      <Slot />
       <View className="relative -bottom-10 right-0">
        <FloatingCartButton />
        </View>
        </SafeAreaView>
    </View>
  );
}
