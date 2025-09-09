// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useContext } from 'react';
// import { Pressable, Text, View } from 'react-native';
// import { CartContext } from '../../../../context/customer/CartContext';

// export default function FloatingCartButton() {
//   const router = useRouter();
//   const context = useContext(CartContext);

//   if (!context) return null;

//   const cartItems = context.getCartItems(); // ✅ Use context method
//   const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

//   if (totalQuantity === 0) return null;

//   return (
//     <Pressable
//       onPress={() => router.push('/customer/shop/cart')}
//       className="absolute bottom-5 right-5 bg-primary rounded-full p-4 shadow-lg z-50"
//     >
//       <View className="relative">
//         <Ionicons name="cart" size={28} color="#fff" />
//         <View className="absolute -top-2 -right-2 bg-white rounded-full px-1.5 min-w-[18px] h-[18px] items-center justify-center">
//           <Text className="text-primary text-xs font-bold">{totalQuantity}</Text>
//         </View>
//       </View>
//     </Pressable>
//   );
// }


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { CartContext } from '../../../../context/customer/CartContext';

export default function FloatingCartButton() {
  const router = useRouter();
  const context = useContext(CartContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [prevQuantity, setPrevQuantity] = useState(0);

  if (!context) return null;

  const cartItems = context.cartItems || [];
  let totalQuantity = 0;
  
  if (Array.isArray(cartItems)) {
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (item && typeof item === 'object') {
        totalQuantity += (item.quantity || 0);
      }
    }
  }

  // Animate when quantity increases
  useEffect(() => {
    if (totalQuantity > prevQuantity) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setPrevQuantity(totalQuantity);
  }, [totalQuantity]);

  if (totalQuantity === 0) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 40, // ⬆️ a bit higher
        right: 20,
        transform: [{ scale: scaleAnim }],
        zIndex: 50,
      }}
    >
      <Pressable
        onPress={() => router.push('/customer/shop/cart')}
        className="bg-primary rounded-full p-4 shadow-lg"
      >
        <View className="relative">
          <Ionicons name="cart" size={28} color="#fff" />
          <View className="absolute -top-2 -right-2 bg-white rounded-full px-1.5 min-w-[18px] h-[18px] items-center justify-center">
            <Text className="text-primary text-xs font-bold">{totalQuantity}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
