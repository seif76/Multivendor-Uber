import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function VendorRegister() {
  // Registration flow states
  const [isCustomer, setIsCustomer] = useState(null); // null = not selected, true = customer, false = not customer
  const [customerVerified, setCustomerVerified] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  
  // Customer verification form
  const [customerForm, setCustomerForm] = useState({
    phone_number: '',
    password: '',
  });

  // Vendor registration form
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    shop_name: '',
    shop_location: '',
    owner_name: '',
  });
  
  const [logo, setLogo] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [shopFrontPhoto, setShopFrontPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleCustomerFormChange = (key, value) => setCustomerForm({ ...customerForm, [key]: value });

  // Use the same pickImage logic as customer registration
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
      const response = await axios.post(`${BACKEND_URL}/api/vendor/auth/check-customer-status`, customerForm);
      setCustomerData(response.data.user);
      setCustomerVerified(true);
      
      // Pre-fill vendor form with customer data
      setForm(prev => ({
        ...prev,
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone_number: response.data.user.phone_number || '',
        gender: response.data.user.gender || '',
      }));
      
      Alert.alert('Success', 'Customer account verified! Please complete your vendor information.');
    } catch (err) {
      setImageError('Customer verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async () => {
    setUploading(true);
    setImageError('');
    
    if (!logo || !logo.uri) {
      setImageError('Logo is required.');
      setUploading(false);
      return;
    }

    // Validate required fields based on whether user is a verified customer
    const requiredFields = customerVerified 
      ? ['shop_name', 'shop_location', 'owner_name'] // Customer only needs vendor-specific fields
      : ['name', 'email', 'password', 'phone_number', 'shop_name', 'shop_location', 'owner_name']; // New user needs all fields

    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      setImageError(`Missing required fields: ${missingFields.join(', ')}`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // Add customer_id for verified customers
    if (customerVerified && customerData) {
      formData.append('customer_id', customerData.id);
    }

    // Add images
    if (logo && logo.uri) {
      formData.append('logo', {
        uri: logo.uri,
        name: logo.name || 'logo.jpg',
        type: logo.type || 'image/jpeg',
      });
    }
    if (passportPhoto && passportPhoto.uri) {
      formData.append('passport_photo', {
        uri: passportPhoto.uri,
        name: passportPhoto.name || 'passport.jpg',
        type: passportPhoto.type || 'image/jpeg',
      });
    }
    if (licensePhoto && licensePhoto.uri) {
      formData.append('license_photo', {
        uri: licensePhoto.uri,
        name: licensePhoto.name || 'license.jpg',
        type: licensePhoto.type || 'image/jpeg',
      });
    }
    if (shopFrontPhoto && shopFrontPhoto.uri) {
      formData.append('shop_front_photo', {
        uri: shopFrontPhoto.uri,
        name: shopFrontPhoto.name || 'shopfront.jpg',
        type: shopFrontPhoto.type || 'image/jpeg',
      });
    }
    
    try {
      // Use different endpoint based on customer verification
      const endpoint = customerVerified 
        ? `${BACKEND_URL}/api/vendor/auth/register-customer-as-vendor`
        : `${BACKEND_URL}/api/vendor/auth/register`;
        
      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/vendor/login');
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
      shop_name: '',
      shop_location: '',
      owner_name: '',
    });
    setImageError('');
  };

  // Step 1: User Type Selection
  if (isCustomer === null) {
    return (
      <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
        <Text className="text-3xl font-bold text-green-600 mb-6 text-center">Vendor Registration</Text>
        
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Are you already a customer?
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            If you're already a customer, we can use your existing account information to create your vendor profile.
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
                  Use my existing account to create vendor profile
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
                  Create a completely new vendor account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600">Already have a vendor account? </Text>
          <Link href="/vendor/login" asChild>
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
          <Text className="text-2xl font-bold text-green-600 ml-4">Verify Customer Account</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Enter your customer credentials
          </Text>
          <Text className="text-gray-600">
            We'll use your existing customer account to create your vendor profile.
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
          className="bg-green-600 py-4 rounded-xl mb-4"
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

  // Step 2b: Vendor Registration Form (for both verified customers and new users)
  return (
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => handleUserTypeSelection(null)}>
          <Ionicons name="arrow-back" size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-green-600 ml-4">
          {customerVerified ? 'Complete Vendor Profile' : 'Vendor Registration'}
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

      {/* Logo Picker - required */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => pickImage(setLogo)}
          className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-green-600 items-center justify-center mb-2"
          activeOpacity={0.7}
        >
          {logo && logo.uri ? (
            <Image
              source={{ uri: logo.uri }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
            />
          ) : (
            <Ionicons name="image" size={44} color="#22c55e" />
          )}
        </TouchableOpacity>
        <Text className="text-xs text-green-700 font-semibold mt-1 text-center">Logo (required)</Text>
      </View>

      {/* Image Pickers - styled like customer registration */}
      <View className="flex-row justify-between mb-6">
        {[{
          label: 'Passport Photo',
          image: passportPhoto,
          setter: setPassportPhoto,
        }, {
          label: 'License Photo',
          image: licensePhoto,
          setter: setLicensePhoto,
        }, {
          label: 'Shop Front Photo',
          image: shopFrontPhoto,
          setter: setShopFrontPhoto,
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
                <Ionicons name="camera" size={36} color="#22c55e" />
              )}
            </TouchableOpacity>
            <Text className="text-xs text-primary font-semibold mt-1 text-center">{label}</Text>
          </View>
        ))}
      </View>
      {imageError ? <Text className="text-red-500 text-xs mb-4 text-center">{imageError}</Text> : null}

      {/* Form Fields - Show different fields based on customer verification */}
      {customerVerified ? (
        // Customer verified - only show vendor-specific fields
        [
          { label: 'Shop Name', key: 'shop_name', keyboard: 'default' },
          { label: 'Shop Location', key: 'shop_location', keyboard: 'default' },
          { label: 'Owner Name', key: 'owner_name', keyboard: 'default' },
        ].map(({ label, key, keyboard, secure }) => (
          <View key={key} className="mb-5">
            <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 focus:border-green-500"
              placeholder={label}
              keyboardType={keyboard}
              secureTextEntry={secure}
              value={form[key]}
              onChangeText={(val) => handleChange(key, val)}
            />
          </View>
        ))
      ) : (
        // New user - show all fields
        [
          { label: 'Full Name', key: 'name', keyboard: 'default' },
          { label: 'Email', key: 'email', keyboard: 'email-address' },
          { label: 'Password', key: 'password', secure: true },
          { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
          { label: 'Shop Name', key: 'shop_name', keyboard: 'default' },
          { label: 'Shop Location', key: 'shop_location', keyboard: 'default' },
          { label: 'Owner Name', key: 'owner_name', keyboard: 'default' },
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
        ))
      )}

      {/* Gender Picker - only show for new users */}
      {!customerVerified && (
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
      )}

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-green-600 py-4 rounded-xl"
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
        <Link href="/vendor/login" asChild>
          <Text className="text-primary font-semibold">Login</Text>
        </Link>
      </View>
    </ScrollView>
  );
} 