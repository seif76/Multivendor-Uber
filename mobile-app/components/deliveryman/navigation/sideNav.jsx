// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import React from 'react';
// import { Modal, Pressable, Text, View } from 'react-native';

// export default function DeliverymanSideNav({ visible, onClose }) {
//   const router = useRouter();

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem('token');
//     router.push('/deliveryMan/login');
//     onClose();
//   };

//   const menuItems = [
//     { icon: 'home', label: 'Home', route: '/deliveryMan/(tabs)/home' },
//     { icon: 'list', label: 'Orders', route: '/deliveryMan/(tabs)/orders' },
//     { icon: 'wallet', label: 'Wallet', route: '/deliveryMan/(tabs)/wallet' },
//     { icon: 'person', label: 'Profile', route: '/deliveryMan/(tabs)/profile' },
//   ];

//   const handleNavigation = (route) => {
//     router.push(route);
//     onClose();
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View className="flex-1 flex-row">
//         {/* Sidebar */}
//         <View className="w-64 bg-white shadow-lg">
//           <View className="pt-16 px-4">
//             <Text className="text-xl font-bold text-blue-600 mb-8">Deliveryman Menu</Text>
            
//             {menuItems.map((item, index) => (
//               <Pressable
//                 key={index}
//                 onPress={() => handleNavigation(item.route)}
//                 className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
//               >
//                 <Ionicons name={item.icon} size={24} color="#3b82f6" />
//                 <Text className="ml-4 text-lg text-gray-700">{item.label}</Text>
//               </Pressable>
//             ))}
            
//             <Pressable
//               onPress={handleLogout}
//               className="flex-row items-center py-4 px-2 mb-2 rounded-lg mt-8"
//             >
//               <Ionicons name="log-out" size={24} color="#ef4444" />
//               <Text className="ml-4 text-lg text-red-500">Logout</Text>
//             </Pressable>
//           </View>
//         </View>
        
//         {/* Overlay */}
//         <Pressable className="flex-1 bg-black/50" onPress={onClose} />
//       </View>
//     </Modal>
//   );
// }


import { FontAwesome5, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function DeliverymanSideNav({ visible, onClose }) {
  const router = useRouter();
  const [deliveryman, setDeliveryman] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const menuItems = [
    { icon: 'home', label: 'Home', route: '/deliveryMan/(tabs)/home' },
    { icon: 'list', label: 'Orders', route: '/deliveryMan/(tabs)/orders' },
    { icon: 'wallet', label: 'Wallet', route: '/deliveryMan/(tabs)/wallet' },
    { icon: 'person', label: 'Profile', route: '/deliveryMan/(tabs)/profile' },
  ];

  const handleNavigate = async (route) => {
    if (route === 'Logout') {
      await AsyncStorage.removeItem('token');
      router.push('/deliveryMan/login');
    } else {
      onClose();
      router.push(route);
    }
  };



  if (!visible) return null;

  return (
    <SafeAreaView className="absolute top-0 left-0 w-[70%] h-full bg-white z-50 ">
      <View className="flex-1 p-5">
        {/* Close */}
        <TouchableOpacity onPress={onClose} className="self-end mb-4">
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* Profile */}
       
        {/* Menu Items */}
        {/* {menuItems.map(({ icon, label, type: Icon, route }, i) => (
          <TouchableOpacity
            key={i}
            className="flex-row items-center py-3 space-x-4"
            onPress={() => handleNavigate(route)}
          >
            <Icon name={icon} size={20} color="#007233" />
            <Text className="text-gray-800">{label}</Text>
          </TouchableOpacity>
        ))} */}
         {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => handleNavigate(item.route)}
                className="flex-row items-center py-4 px-2 mb-2 rounded-lg"
              >
                <MaterialIcons name={item.icon} size={24} color="green" />
                <Text className="ml-4 text-lg text-gray-700">{item.label}</Text>
              </Pressable>
            ))}

        {/* Switch Role */}
        <TouchableOpacity onPress={() => handleNavigate('Logout')} className="mt-auto rounded-full bg-red-500 p-3 items-center justify-center">
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

