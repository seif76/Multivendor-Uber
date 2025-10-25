// import { FontAwesome } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { Pressable, View } from 'react-native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


// export default function TopNavbar() {

  
//   const [isOn, setIsOn] = useState(false);


//   return (
//     <View className="flex-row items-center justify-between px-4 py-6 bg-white shadow">
//       <View className="flex-row items-center space-x-3">
//       <FontAwesome name="user-circle" size={34} color="#0f9d58" />
      
//       <Pressable
//       onPress={() => setIsOn(!isOn)}
//       className={`w-12 h-6 rounded-full flex-row items-center px-1 ${
//         isOn ? 'bg-gray-300' : 'bg-gray-300'
//       }`}
//     >
//       <View
//         className={`w-5 h-5 rounded-full bg-gray-800 justify-center items-center ${
//           isOn ? 'ml-auto' : 'mr-auto'
//         }`}
//       >
//         <MaterialCommunityIcons
//           name="steering"
//           size={12}
//           color="#fff"
//         />
//       </View>
//     </Pressable>
//         {/* <Image
//           source={require('../../../assets/images/Elnaizak-logo.jpeg')} // <-- Replace with your actual logo path
//           style={{ width: 40, height: 40, resizeMode: 'contain' }}
//         /> 
//         <Text className="text-xl font-bold text-green-700">Elnaizak</Text>
//         */}
        
//       </View>

      
//     </View>
//   );
// }




import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TopNavbar({onProfilePress , isOnline, setIsOnline}) {
  const [isOn, setIsOn] = useState(false);

  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white shadow">
      {/* Left Side: User Icon */}
      
       <Pressable onPress={onProfilePress} className="flex-row items-center space-x-3">
        <FontAwesome name="user-circle" size={34} color="#0f9d58" />
      </Pressable>

      {/* Right Side: Toggle */}
      {/* <Pressable
        onPress={() => setIsOn(!isOn)}
        className={`w-20 h-10 rounded-full flex-row items-center px-1 ${
          isOn ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <View
          className={`w-8 h-8 rounded-full  justify-center items-center ${
            isOn ? 'ml-auto bg-gray-800 ' : 'mr-auto  bg-primary '
          }`}
        >
          <MaterialCommunityIcons
            name="steering"
            size={22}
            color="#fff"
          />
        </View>
      </Pressable> */}

      {/* Online Toggle */}
      <Pressable
        onPress={() => setIsOnline(!isOnline)}
        className={`w-20 h-10 rounded-full flex-row items-center px-1 ${
          isOnline ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <View
          className={`w-8 h-8 rounded-full justify-center items-center ${
            isOnline ? 'ml-auto bg-gray-800' : 'mr-auto bg-primary'
          }`}
        >
          <MaterialCommunityIcons name="steering" size={22} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}
