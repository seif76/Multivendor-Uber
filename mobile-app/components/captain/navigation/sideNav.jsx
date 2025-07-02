// import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import React from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';

// export default function SideNav({ visible, onClose }) {
//   const navigation = useNavigation();

//   if (!visible) return null;

//   const menuItems = [
//     { icon: 'home', label: 'Home', type: MaterialIcons, route: 'Home' },
//     { icon: 'dashboard', label: 'Dashboard', type: MaterialIcons, route: 'Dashboard' },
//     { icon: 'bell-outline', label: 'Notifications', type: MaterialCommunityIcons, route: 'Notifications' },
//     { icon: 'history', label: 'Ride History', type: MaterialCommunityIcons, route: 'RideHistory' },
//     { icon: 'wallet', label: 'Wallet', type: MaterialCommunityIcons, route: 'Wallet' },
//     { icon: 'gift', label: 'Earn more', type: MaterialCommunityIcons, route: 'EarnMore' },
//     { icon: 'headset', label: 'Get Help', type: MaterialCommunityIcons, route: 'Help' },
//     { icon: 'logout', label: 'Logout', type: MaterialCommunityIcons, route: 'Logout' },
//   ];

//   const handleNavigate = (route) => {
//     onClose();
//     navigation.navigate(route);
//   };

//   return (
//     <View className="absolute top-0 bottom-0 left-0 h-full w-[80%] bg-white shadow-lg z-50 p-5">
//       {/* Close Button */}
//       <TouchableOpacity onPress={onClose} className="self-end mb-4">
//         <MaterialCommunityIcons name="close" size={24} color="#000" />
//       </TouchableOpacity>

//       {/* Profile Section */}
//       <View className="items-center mb-6">
//         <FontAwesome5 name="user-circle" size={64} color="#999" />
//         <Text className="mt-2 font-semibold text-lg">أحمد راشد</Text>
//         <Text className="text-pink-500">view profile</Text>
//       </View>

//       {/* Navigation Links */}
//       {menuItems.map(({ icon, label, type: Icon, route }, i) => (
//         <TouchableOpacity
//           key={i}
//           className="flex-row items-center py-3 space-x-4"
//           onPress={() => handleNavigate(route)}
//         >
//           <Icon name={icon} size={20} color="#000" />
//           <Text>{label}</Text>
//         </TouchableOpacity>
//       ))}

//       {/* Bottom Button */}
//       <TouchableOpacity className="mt-10 rounded-full bg-pink-100 p-3 items-center">
//         <Text className="text-pink-600 font-semibold">Switch to Rider</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }


import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SideNav({ visible, onClose }) {
    const router = useRouter();

  if (!visible) return null;

  const menuItems = [
    { icon: 'home', label: 'Home', type: MaterialIcons, route: '/captain/home' },
    { icon: 'dashboard', label: 'Dashboard', type: MaterialIcons, route: '/captain/login' },
    { icon: 'bell-outline', label: 'Notifications', type: MaterialCommunityIcons, route: '/captain/inbox' },
    { icon: 'history', label: 'Ride History', type: MaterialCommunityIcons, route: 'RideHistory' },
    { icon: 'wallet', label: 'Wallet', type: MaterialCommunityIcons, route: '/captain/wallet' },
    { icon: 'headset', label: 'Chat', type: MaterialCommunityIcons, route: '/captain/chat' },
    { icon: 'logout', label: 'Logout', type: MaterialCommunityIcons, route: 'Logout' },
  ];

  const handleNavigate = (route) => {
    if(route == 'Logout'){
    // here will be the function of removing cookies , jwt , localstorage , ect...    
    router.push('/');
    }else{
    onClose();
    router.push(route);
    }  
};

  return (
    <SafeAreaView className="absolute top-0 left-0 w-[70%] h-full bg-white  z-50">
      <View className="flex-1 p-5">
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} className="self-end mb-4">
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View className="items-center mb-6">
          <FontAwesome5 name="user-circle" size={64} color="#999" />
          <Text className="mt-2 font-semibold text-lg">أحمد راشد</Text>
          <Text className="text-pink-500">view profile</Text>
        </View>

        {/* Navigation Links */}
        {menuItems.map(({ icon, label, type: Icon, route }, i) => (
          <TouchableOpacity
            key={i}
            className="flex-row items-center py-3 space-x-4"
            onPress={() => handleNavigate(route)}
          >
            <Icon name={icon} size={20} color="#000" />
            <Text>{label}</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom Button */}
        <TouchableOpacity className="mt-auto rounded-full bg-primary p-3 items-center justify-center">
          <Text className="text-white font-semibold">Switch to Rider</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
