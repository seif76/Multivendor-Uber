import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import mime from "mime";


// import * as FileSystem from "expo-file-system";

// const uriToFile = async (uri) => {
  
//   if (uri.startsWith("content://")) {
//     const fileName = uri.split("/").pop();
//     const filePath = `${FileSystem.cacheDirectory}${fileName}`;
//     await FileSystem.copy({ from: uri, to: filePath });
//     return filePath;
//   }
//   return uri;
// };

// const normalizeFile = async (file) => {
//   if (!file?.uri) return null;

//   const fixedUri = await uriToFile(file.uri);
//   const name = file.name || fixedUri.split("/").pop();
//   const type = file.type || "image/jpeg";

//   return { uri: fixedUri, name, type };
// };
export default function DeliverymanRegister() {
  // Registration flow states
  const [isCustomer, setIsCustomer] = useState(null); // null = not selected, true = customer, false = not customer
  const [customerVerified, setCustomerVerified] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  
  // Customer verification form
  const [customerForm, setCustomerForm] = useState({
    phone_number: '',
    password: '',
  });

  // Deliveryman registration form
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
  });

  // Vehicle information
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vehicle_type: '',
    color: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [driverLicensePhoto, setDriverLicensePhoto] = useState(null);
  const [nationalIdPhoto, setNationalIdPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleVehicleChange = (key, value) => setVehicleData({ ...vehicleData, [key]: value });
  const handleCustomerFormChange = (key, value) => setCustomerForm({ ...customerForm, [key]: value });

  // Use the same pickImage logic as vendor registration
  const pickImage = async (setter) => {
    setImageError('');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setImageError('Permission to access media library is required!');
        Alert.alert('Permission required', 'Please allow access to your photos to select a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setter({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      } else {
        setter(null);
      }
    } catch (err) {
      setImageError('Failed to pick image.');
    }
  };

  // Check customer status
  const handleCustomerCheck = async () => {
    setVerifying(true);
    setImageError('');
    
    if (!customerForm.phone_number || !customerForm.password) {
      setImageError('Phone number and password are required.');
      setVerifying(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/deliveryman/auth/check-customer-status`, customerForm);
      setCustomerData(response.data.user);
      setCustomerVerified(true);
      
      // Pre-fill deliveryman form with customer data
      setForm(prev => ({
        ...prev,
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone_number: response.data.user.phone_number || '',
        gender: response.data.user.gender || '',
      }));
      
      Alert.alert('Success', 'Customer account verified! Please complete your deliveryman information.');
    } catch (err) {
      setImageError('Customer verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async () => {
    setUploading(true);
    setImageError('');
    
    // Validate required fields based on whether user is a verified customer
    const requiredFields = customerVerified 
      ? [] // Customer only needs vehicle-specific fields
      : ['name', 'email', 'password', 'phone_number', 'gender']; // New user needs all fields

    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      setImageError(`Missing required fields: ${missingFields.join(', ')}`);
      setUploading(false);
      return;
    }

    // Validate vehicle data
    const requiredVehicleFields = ['make', 'model', 'year', 'license_plate', 'vehicle_type', 'color'];
    const missingVehicleFields = requiredVehicleFields.filter(field => !vehicleData[field]);
    if (missingVehicleFields.length > 0) {
      setImageError(`Missing vehicle fields: ${missingVehicleFields.join(', ')}`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
   
    // Add vehicle data
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value) formData.append(`vehicleData[${key}]`, value);
    });

    // Add customer_id for verified customers
    if (customerVerified && customerData) {
      
      formData.append('customer_id', customerData.id);
    }


    // // Add images
    // if (profilePhoto && profilePhoto.uri) {
    //   formData.append('profile_photo', {
    //     uri: profilePhoto.uri,
    //     name: profilePhoto.name || 'profile.jpg',
    //     type: profilePhoto.type || 'image/jpeg',
    //   });
    // }
    // if (driverLicensePhoto && driverLicensePhoto.uri) {
    //   formData.append('driver_license_photo', {
    //     uri: driverLicensePhoto.uri,
    //     name: driverLicensePhoto.name || 'driver_license.jpg',
    //     type: driverLicensePhoto.type || 'image/jpeg',
    //   });
    // }
    // if (nationalIdPhoto && nationalIdPhoto.uri) {
    //   formData.append('national_id_photo', {
    //     uri: nationalIdPhoto.uri,
    //     name: nationalIdPhoto.name || 'national_id.jpg',
    //     type: nationalIdPhoto.type || 'image/jpeg',
    //   });
    // }
        // Normalize and append images
        // const normalizedProfile = await normalizeFile(profilePhoto);
        // const normalizedLicense = await normalizeFile(driverLicensePhoto);
        // const normalizedID = await normalizeFile(nationalIdPhoto);
    
        // if (normalizedProfile)
        //   formData.append("profile_photo", normalizedProfile);
        // if (normalizedLicense)
        //   formData.append("driver_license_photo", normalizedLicense);
        // if (normalizedID)
        //   formData.append("national_id_photo", normalizedID);
        const appendFile = (fieldName, file) => {
          if (!file) return;
          const newImageUri = file.uri;
          const fileName = newImageUri.split("/").pop();
          const fileType = mime.getType(newImageUri);
    
          formData.append(fieldName, {
            uri: newImageUri,
            type: fileType,
            name: fileName,
          });
        };
    
        // Add all images
        if (nationalIdPhoto ) {
        appendFile("profile_photo", profilePhoto);
        }
        if (driverLicensePhoto ) {
          appendFile("driver_license_photo", driverLicensePhoto);
          }
          if (driverLicensePhoto ) {
            appendFile("national_id_photo", nationalIdPhoto);
            }
       
        

       
    try {
      // Use different endpoint based on customer verification
      const endpoint = customerVerified 
        ? `${BACKEND_URL}/api/deliveryman/register-customer`
        : `${BACKEND_URL}/api/deliveryman/register`;
        alert("endpoint" + endpoint)
      // await axios.post(endpoint, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        transformRequest: (data) => data, // <- prevents Axios from messing with FormData
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/deliveryMan/login');
    } catch (err) {
      setImageError('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Reset form when user type changes
  const handleUserTypeSelection = (isCustomerUser) => {
    setIsCustomer(isCustomerUser);
    setCustomerVerified(false);
    setCustomerData(null);
    setCustomerForm({ phone_number: '', password: '' });
    setForm({
      name: '',
      email: '',
      password: '',
      phone_number: '',
      gender: '',
    });
    setVehicleData({
      make: '',
      model: '',
      year: '',
      license_plate: '',
      vehicle_type: '',
      color: '',
    });
    setImageError('');
  };

  // Step 1: User Type Selection
  if (isCustomer === null) {
    return (
      <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
        <Text className="text-3xl font-bold text-primary mb-6 text-center">Deliveryman Registration</Text>
        
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Are you already a customer?
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            If you're already a customer, we can use your existing account information to create your deliveryman profile.
          </Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => handleUserTypeSelection(true)}
            className="bg-green-50 mb-4 border-2 border-green-200 p-6 rounded-xl"
            activeOpacity={0.7}
          >
            <View className="flex-row mb-4 items-center">
              <Ionicons name="person-check" size={24} color="#22c55e" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-green-800">Yes, I'm a customer</Text>
                <Text className="text-sm text-green-600 mt-1">
                  Use my existing account to create deliveryman profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#22c55e" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleUserTypeSelection(false)}
            className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl"
            activeOpacity={0.7}
          >
            <View className="flex-row mb-4 items-center">
              <Ionicons name="person-add" size={24} color="#6b7280" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-800">No, I'm new</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Create a completely new deliveryman account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600">Already have a deliveryman account? </Text>
          <Link href="/deliveryMan/login" asChild>
            <Text className="text-primary font-semibold">Login</Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  // Step 2a: Customer Verification
  if (isCustomer && !customerVerified) {
    return (
      <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => handleUserTypeSelection(null)}>
            <Ionicons name="arrow-back" size={24} color="#22c55e" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-primary ml-4">Verify Customer Account</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Enter your customer credentials
          </Text>
          <Text className="text-gray-600">
            We'll use your existing customer account to create your deliveryman profile.
          </Text>
        </View>

        {/* Customer Verification Form */}
        {[
          { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
          { label: 'Password', key: 'password', secure: true },
        ].map(({ label, key, keyboard, secure }) => (
          <View key={key} className="mb-5">
            <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-green-500"
              placeholder={label}
              keyboardType={keyboard}
              secureTextEntry={secure}
              value={customerForm[key]}
              onChangeText={(val) => handleCustomerFormChange(key, val)}
            />
          </View>
        ))}

        {imageError ? <Text className="text-red-500 text-sm mb-4">{imageError}</Text> : null}

        <TouchableOpacity
          onPress={handleCustomerCheck}
          className="bg-primary py-4 rounded-xl mb-4"
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-lg">Verify Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleUserTypeSelection(null)}
          className="bg-gray-200 py-3 rounded-xl"
        >
          <Text className="text-center text-gray-700 font-semibold">Back</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step 2b: Deliveryman Registration Form (for both verified customers and new users)
  return (
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => handleUserTypeSelection(null)}>
          <Ionicons name="arrow-back" size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-primary ml-4">
          {customerVerified ? 'Complete Deliveryman Profile' : 'Deliveryman Registration'}
        </Text>
      </View>

      {customerVerified && (
        <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text className="text-green-800 font-semibold ml-2">Customer Account Verified</Text>
          </View>
          <Text className="text-green-700 text-sm mt-1">
            Using account: {customerData?.name} ({customerData?.phone_number})
          </Text>
        </View>
      )}

      {/* Profile Photo Picker */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => pickImage(setProfilePhoto)}
          className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-green-600 items-center justify-center mb-2"
          activeOpacity={0.7}
        >
          {profilePhoto && profilePhoto.uri ? (
            <Image
              source={{ uri: profilePhoto.uri }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
            />
          ) : (
            <Ionicons name="person" size={44} color="#22c55e" />
          )}
        </TouchableOpacity>
        <Text className="text-xs text-green-700 font-semibold mt-1 text-center">Profile Photo (optional)</Text>
      </View>

      {/* Document Pickers */}
      <View className="flex-row justify-between mb-6">
        {[{
          label: 'Driver License',
          image: driverLicensePhoto,
          setter: setDriverLicensePhoto,
        }, {
          label: 'National ID',
          image: nationalIdPhoto,
          setter: setNationalIdPhoto,
        }].map(({ label, image, setter }, idx) => (
          <View key={label} className="items-center flex-1 mx-1">
            <TouchableOpacity
              onPress={() => pickImage(setter)}
              className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-green-400 items-center justify-center mb-2"
              activeOpacity={0.7}
            >
              {image && image.uri ? (
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <Ionicons name="document" size={36} color="#22c55e" />
              )}
            </TouchableOpacity>
            <Text className="text-xs text-primary font-semibold mt-1 text-center">{label}</Text>
          </View>
        ))}
      </View>
      {imageError ? <Text className="text-red-500 text-xs mb-4 text-center">{imageError}</Text> : null}

      {/* Form Fields - Show different fields based on customer verification */}
      {customerVerified ? (
        // Customer verified - only show vehicle fields
        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</Text>
          {[
            { label: 'Make', key: 'make', keyboard: 'default' },
            { label: 'Model', key: 'model', keyboard: 'default' },
            { label: 'Year', key: 'year', keyboard: 'numeric' },
            { label: 'License Plate', key: 'license_plate', keyboard: 'default' },
            { label: 'Color', key: 'color', keyboard: 'default' },
          ].map(({ label, key, keyboard }) => (
            <View key={key} className="mb-5">
              <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-green-500"
                placeholder={label}
                keyboardType={keyboard}
                value={vehicleData[key]}
                onChangeText={(val) => handleVehicleChange(key, val)}
              />
            </View>
          ))}
          
          {/* Vehicle Type Picker */}
          <View className="mb-6">
            <Text className="mb-2 text-gray-700 font-medium">Vehicle Type</Text>
            <View className="flex-row space-x-4">
              {['car', 'motorcycle', 'bicycle'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleVehicleChange('vehicle_type', type)}
                  className={`flex-1 mx-1 py-3 rounded-xl border ${
                    vehicleData.vehicle_type === type ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-center text-base font-medium ${
                    vehicleData.vehicle_type === type ? 'text-white' : 'text-gray-800'
                  }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : (
        // New user - show all fields
        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-4">Personal Information</Text>
          {[
            { label: 'Full Name', key: 'name', keyboard: 'default' },
            { label: 'Email', key: 'email', keyboard: 'email-address' },
            { label: 'Password', key: 'password', secure: true },
            { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
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

          <Text className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</Text>
          {[
            { label: 'Make', key: 'make', keyboard: 'default' },
            { label: 'Model', key: 'model', keyboard: 'default' },
            { label: 'Year', key: 'year', keyboard: 'numeric' },
            { label: 'License Plate', key: 'license_plate', keyboard: 'default' },
            { label: 'Color', key: 'color', keyboard: 'default' },
          ].map(({ label, key, keyboard }) => (
            <View key={key} className="mb-5">
              <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-green-500"
                placeholder={label}
                keyboardType={keyboard}
                value={vehicleData[key]}
                onChangeText={(val) => handleVehicleChange(key, val)}
              />
            </View>
          ))}
          
          {/* Vehicle Type Picker */}
          <View className="mb-6">
            <Text className="mb-2 text-gray-700 font-medium">Vehicle Type</Text>
            <View className="flex-row space-x-4">
              {['car', 'motorcycle', 'bicycle'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleVehicleChange('vehicle_type', type)}
                  className={`flex-1 mx-1 py-3 rounded-xl border ${
                    vehicleData.vehicle_type === type ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-center text-base font-medium ${
                    vehicleData.vehicle_type === type ? 'text-white' : 'text-gray-800'
                  }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-primary py-4 rounded-xl"
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg">
            {customerVerified ? 'Complete Registration' : 'Register'}
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Login Link */}
      <View className="flex-row justify-center mt-2">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/deliveryMan/login" asChild>
          <Text className="text-primary font-semibold">Login</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
