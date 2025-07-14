// import { Link } from 'expo-router';
// import { Image, Pressable, Text, TextInput, View } from 'react-native';

// export default function CustomerRegister() {
//   return (
//     <View className="flex-1 bg-white px-6 justify-center">
//       {/* Logo */}
//       <View className="items-center mb-6">
//         <Image
//           source={require('../../assets/images/Elnaizak-logo.jpeg')} // Update the path if needed
//           className="w-24 h-24"
//           resizeMode="contain"
//         />
//       </View>

//       {/* Heading */}
//       <Text className="text-2xl font-bold text-center mb-4 text-primary">Create Customer Account</Text>

//       {/* Full Name */}
//       <TextInput
//         placeholder="Full Name"
//         className="border border-gray-300 rounded px-4 py-3 mb-3"
//         placeholderTextColor="#888"
//       />

//       {/* Phone */}
//       <TextInput
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         className="border border-gray-300 rounded px-4 py-3 mb-3"
//         placeholderTextColor="#888"
//       />

//       {/* Email */}
//       <TextInput
//         placeholder="Email Address"
//         keyboardType="email-address"
//         className="border border-gray-300 rounded px-4 py-3 mb-3"
//         placeholderTextColor="#888"
//       />

//       {/* Password */}
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         className="border border-gray-300 rounded px-4 py-3 mb-4"
//         placeholderTextColor="#888"
//       />

//       {/* Register Button */}
//       <Pressable className="bg-primary py-3 rounded items-center mb-4">
//         <Text className="text-white font-bold text-lg">Register</Text>
//       </Pressable>

//       {/* Already have an account */}
//       <View className="flex-row justify-center mt-2">
//         <Text className="text-gray-600">Already have an account? </Text>
//         <Link href="/customer/login" asChild>
//           <Text className="text-blue-600 font-semibold">Login</Text>
//         </Link>
//       </View>
//     </View>
//   );
// }



// import axios from 'axios';
// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function CustomerRegister() {
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     phone_number: '',
//     gender: '',
//     profile_photo: '',
//   });
//   const router = useRouter();

//   const handleChange = (key, value) => {
//     setForm({ ...form, [key]: value });
//   };

//   const handleRegister = async () => {
//     try {
//       const res = await axios.post('https://your-api-url.com/api/register', form);
//       Alert.alert('Success', 'Registration successful!');
//       router.push('/customer/login');
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', err?.response?.data?.message || 'Something went wrong');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ padding: 20 }} className="bg-white flex-1">
//       <Text className="text-2xl font-bold text-green-600 mb-4 text-center">Create a Customer Account</Text>

//       {/* Profile Photo Preview */}
//       {form.profile_photo !== '' && (
//         <Image
//           source={{ uri: form.profile_photo }}
//           className="w-24 h-24 rounded-full self-center mb-4"
//         />
//       )}

//       {/* Form Fields */}
//       {[
//         { label: 'Full Name', key: 'name', keyboard: 'default' },
//         { label: 'Email', key: 'email', keyboard: 'email-address' },
//         { label: 'Password', key: 'password', secure: true },
//         { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
//         { label: 'Profile Photo URL', key: 'profile_photo' },
//       ].map(({ label, key, keyboard, secure }) => (
//         <View key={key} className="mb-4">
//           <Text className="mb-1 text-gray-700">{label}</Text>
//           <TextInput
//             className="border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
//             placeholder={label}
//             keyboardType={keyboard}
//             secureTextEntry={secure}
//             value={form[key]}
//             onChangeText={(val) => handleChange(key, val)}
//           />
//         </View>
//       ))}

//       {/* Gender Picker */}
//       <View className="mb-4">
//         <Text className="mb-1 text-gray-700">Gender</Text>
//         <View className="flex-row space-x-4">
//           {['male', 'female'].map((g) => (
//             <TouchableOpacity
//               key={g}
//               onPress={() => handleChange('gender', g)}
//               className={`flex-1 py-2 rounded-lg border ${
//                 form.gender === g ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
//               }`}
//             >
//               <Text className={`text-center ${form.gender === g ? 'text-white' : 'text-gray-800'}`}>
//                 {g.charAt(0).toUpperCase() + g.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Register Button */}
//       <TouchableOpacity
//         onPress={handleRegister}
//         className="bg-green-600 p-3 rounded-lg mt-4"
//       >
//         <Text className="text-center text-white font-semibold text-lg">Register</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }



import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    profile_photo: '',
  });
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/customers/register`, form);
      alert('Success', 'Registration successful!');
      router.push('/customer/login');
    } catch (err) {
      alert(err);
     // Alert.alert('Error', err?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <Text className="text-3xl font-bold text-green-600 mb-6 text-center">Create Your Account</Text>

      {/* Profile Photo Preview */}
      {form.profile_photo !== '' && (
        <Image
          source={{ uri: form.profile_photo }}
          className="w-24 h-24 rounded-full self-center mb-5 border border-green-500"
        />
      )}

      {/* Form Fields */}
      {[
        { label: 'Full Name', key: 'name', keyboard: 'default' },
        { label: 'Email', key: 'email', keyboard: 'email-address' },
        { label: 'Password', key: 'password', secure: true },
        { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
        { label: 'Profile Photo URL', key: 'profile_photo' },
      ].map(({ label, key, keyboard, secure }) => (
        <View key={key} className="mb-5">
          <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-green-500"
            placeholder={label}
            keyboardType={keyboard}
            secureTextEntry={secure}
            value={form[key]}
            onChangeText={(val) => handleChange(key, val)}
          />
        </View>
      ))}

      {/* Gender Picker */}
      <View className="mb-6">
        <Text className="mb-2 text-gray-700 font-medium">Gender</Text>
        <View className="flex-row space-x-4">
          {['male', 'female'].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => handleChange('gender', g)}
              className={`flex-1 mx-2 py-3 rounded-xl border ${
                form.gender === g ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={`text-center text-base font-medium ${
                form.gender === g ? 'text-white' : 'text-gray-800'
              }`}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-green-600 py-4 rounded-xl"
      >
        <Text className="text-center text-white font-bold text-lg">Register</Text>
      </TouchableOpacity>

       {/* Login Link */}
       <View className="flex-row justify-center mt-2">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/customer/login" asChild>
          <Text className="text-blue-600 font-semibold">Login</Text>
        </Link>
      </View>

    </ScrollView>
  );
}
