import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react'; // Added useEffect
import { 
  Image, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator,
  Modal, // Added Modal
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import mime from "mime";
// No Picker import is needed

export default function VendorRegister() {
  // Registration flow states
  const [isCustomer, setIsCustomer] = useState(null); 
  const [customerVerified, setCustomerVerified] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  
  // Customer verification form
  const [customerForm, setCustomerForm] = useState({
    phone_number: '',
    password: '',
  });

  // Vendor registration form (with shop_category_id)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    shop_name: '',
    shop_location: '',
    owner_name: '',
    category: '', // Category ID is part of the form state
  });
  
  const [logo, setLogo] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [shopFrontPhoto, setShopFrontPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // --- STATE for custom pickers ---
  const [categories, setCategories] = useState([]);
  const [securePassword, setSecurePassword] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const primaryColor = "#20df20"; // New primary color

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleCustomerFormChange = (key, value) => setCustomerForm({ ...customerForm, [key]: value });


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- Handler for selecting an item ---
  const handleSelectCategory = (categoryId) => {
    handleChange('category', categoryId); // Updates the form
    setIsDropdownOpen(false); // Closes the dropdown
  };

  // Find the selected category name to display
  const selectedCategoryName =
    categories.find((c) => c.id === form.category)?.name || 'Select a category...';
  // --- DEDICATED FUNCTION TO FETCH CATEGORIES (Improved) ---
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/category`);
      
      let categoriesArray = [];
      
      // Check for common array structures in the response
      if (Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesArray = response.data.categories;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoriesArray = response.data.data;
      }
      
      setCategories(categoriesArray); 

    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setImageError('Failed to load shop categories. Please try again.');
      setCategories([]); // Ensure it's always an array, even on error
    }
  };

  // Fetch categories when the main registration form is shown
  useEffect(() => {
    if (isCustomer === false || customerVerified === true) {
      fetchCategories();
    }
  }, [isCustomer, customerVerified]);

  // pickImage logic (from your original code)
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

  // handleCustomerCheck logic (from your original code)
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

  // handleRegister logic (from your original code, with category validation fix)
  const handleRegister = async () => {
    setUploading(true);
    setImageError('');
    
    if (!logo || !logo.uri) {
      setImageError('Logo is required.');
      setUploading(false);
      return;
    }

    // Validate required fields (with category added)
    const requiredFields = customerVerified 
      ? ['shop_name', 'shop_location', 'owner_name', 'category']
      : ['name', 'email', 'password', 'phone_number', 'shop_name', 'shop_location', 'owner_name', 'gender', 'category'];

    // --- FIX: Changed validation to allow '0' as a valid ID ---
    const missingFields = requiredFields.filter(field => 
      form[field] === null || form[field] === undefined || form[field] === ''
    );
    
    if (missingFields.length > 0) {
      setImageError(`Missing required fields: ${missingFields.join(', ')}`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      // Ensure value is not null/undefined before appending
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Add customer_id for verified customers
    if (customerVerified && customerData) {
      formData.append('customer_id', customerData.id);
    }
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

    // Add images
    if (logo ) {
      appendFile("logo", logo);
    }
    if (passportPhoto ) {
      appendFile('passport_photo',passportPhoto);
    }
    if (licensePhoto ) {
      appendFile('license_photo', licensePhoto);
    }
    if (shopFrontPhoto ) {
      appendFile('shop_front_photo', shopFrontPhoto);
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
      // This is where your ROLLBACK error originates. Check your backend console for the *specific* database error.
      // It is most likely a duplicate email or phone number.
      setImageError('Registration failed: ' + (err.response?.data?.error || 'A user with this email or phone may already exist.'));
      console.error("Registration Error:", err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  // handleUserTypeSelection logic (from your original code)
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
      category: '', // Reset category
    });
    setImageError('');
  };

  // Step 1: User Type Selection (Original Design)
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

  // Step 2a: Customer Verification (Original Design)
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

  // --- STEP 2B: REDESIGNED VENDOR FORM (LIGHT MODE ONLY) ---
  
  // --- FIX: renderInput helper updated with icon padding ---
  const renderInput = (label, key, placeholder, keyboardType = 'default', iconName = null) => (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <View className="relative">
        <TextInput
          className={`w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 ${
            iconName ? 'pl-10 pr-4' : 'px-4' // Dynamic padding
          }`}
          style={{ focus: { borderColor: primaryColor } }} 
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={form[key]}
          onChangeText={(val) => handleChange(key, val)}
        />
        {iconName && (
          // --- FIX: Centered icon positioning ---
          <View className="absolute left-3 top-0 bottom-0 justify-center">
             <Ionicons name={iconName} size={20} color="#9CA3AF" />
          </View>
        )}
      </View>
    </View>
  );

  return (
    // --- FIX: Removed dark: classes ---
    <View className="flex-1 bg-white">
      {/* New App Bar */}
      <View className="flex-row items-center bg-white p-4 pb-3 justify-between sticky top-0 z-10 border-b border-gray-200 pt-12">
        <TouchableOpacity onPress={() => handleUserTypeSelection(null)}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center text-gray-900">
          {customerVerified ? 'Complete Vendor Profile' : 'New Store Registration'}
        </Text>
        <View className="w-10" /> 
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="space-y-6">
          {/* Customer Verified Banner */}
          {customerVerified && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="text-green-800 font-semibold ml-2">Customer Account Verified</Text>
              </View>
              <Text className="text-green-700 text-sm mt-1">
                Using account: {customerData?.name} ({customerData?.phone_number})
              </Text>
            </View>
          )}

          {/* Visual Identity Section */}
          <View>
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Visual Identity</Text>
            <View className="flex-row gap-4">
              {/* Logo Picker */}
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setLogo)}
                  className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  {logo && logo.uri ? (
                    <Image source={{ uri: logo.uri }} className="w-28 h-28 rounded-full" />
                  ) : (
                    <Ionicons name="camera-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Logo (Required)</Text>
              </View>
              {/* Shop Front Photo Picker */}
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setShopFrontPhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {shopFrontPhoto && shopFrontPhoto.uri ? (
                    <Image source={{ uri: shopFrontPhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Shop Front Photo</Text>
              </View>
            </View>
          </View>

          {/* --- FIX: Added margin-top (mt-4) --- */}
          <View className="mt-4">
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Legal & Verification</Text>
            <View className="flex-row gap-4">
              {/* License Photo Picker */}
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setLicensePhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {licensePhoto && licensePhoto.uri ? (
                    <Image source={{ uri: licensePhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="document-text-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">License Photo</Text>
              </View>
              {/* Passport Photo Picker */}
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setPassportPhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {passportPhoto && passportPhoto.uri ? (
                    <Image source={{ uri: passportPhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="person-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Owner's ID Photo</Text>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {imageError ? (
            <Text className="text-red-500 text-sm text-center">{imageError}</Text>
          ) : null}

          {/* Account Information & Store Details */}
          <View className="space-y-4">
            {customerVerified ? (
              // Customer verified - only show vendor-specific fields
              <>
                {renderInput('Shop Name', 'shop_name', 'Enter your shop name')}
                {renderInput('Shop Location', 'shop_location', 'Select location on map', 'default', 'location-outline')}
                {renderInput('Owner Name', 'owner_name', 'Enter the owner\'s name')}
              </>
            ) : (
              // New user - show all fields
              <>
                {renderInput('Full Name', 'name', 'Enter your full name')}
                {renderInput('Email', 'email', 'example@email.com', 'email-address')}
                
                {/* --- FIX: Special case for password with icon padding --- */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                  <View className="relative">
                    <TextInput
                      className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 pl-10 pr-4" // Added padding
                      style={{ focus: { borderColor: primaryColor } }}
                      placeholder="********"
                      secureTextEntry={securePassword}
                      value={form.password}
                      onChangeText={(val) => handleChange('password', val)}
                    />
                    {/* --- FIX: Centered icon positioning --- */}
                    <TouchableOpacity 
                      className="absolute left-3 top-0 bottom-0 justify-center"
                      onPress={() => setSecurePassword(prev => !prev)}
                    >
                      <Ionicons name={securePassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {renderInput('Phone Number', 'phone_number', 'Enter phone number', 'phone-pad')}
                {renderInput('Shop Name', 'shop_name', 'Enter your shop name')}
                {renderInput('Shop Location', 'shop_location', 'Select location on map', 'default', 'location-outline')}
                {renderInput('Owner Name', 'owner_name', 'Enter the owner\'s name')}
              </>
            )}

            {/* --- CUSTOM CATEGORY PICKER (No dark classes) ---
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Shop Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
              >
                <Text className={form.category === '' ? 'text-gray-400' : 'text-gray-900'}>
                  {categories.find(c => c.id === form.category)?.name || 'Select a category...'}
                </Text>
              </TouchableOpacity>
            </View> */}

            <View className="mb-5">
        <Text className="text-sm font-medium text-gray-700 mb-1">Shop Category</Text>

        {/* 1. The Dropdown "Button" */}
        <TouchableOpacity
          // It's styled just like your TextInput
          className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 flex-row justify-between items-center"
          onPress={() => setIsDropdownOpen((prev) => !prev)} // Toggles the list
        >
          <Text
            className={`text-base ${
              form.category === '' ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            {selectedCategoryName}
          </Text>
          <Ionicons
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>

        {/* 2. The Dropdown "List" */}
        {isDropdownOpen && (
          <View className="border border-gray-300 rounded-xl mt-1 bg-white">
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              // We set a max height in case the list is very long
              style={{ maxHeight: 200 }} 
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-gray-200"
                  onPress={() => handleSelectCategory(item.name)}
                >
                  <Text className="text-base text-gray-800">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

            {/* --- CUSTOM GENDER PICKER (No dark classes) --- */}
            {!customerVerified && (
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Gender</Text>
                <TouchableOpacity
                  onPress={() => setShowGenderModal(true)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
                >
                  <Text className={`capitalize ${!form.gender ? 'text-gray-400' : 'text-gray-900'}`}>
                    {form.gender || 'Select gender...'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Register Button */}
          <View className="pt-4 pb-8">
            <TouchableOpacity
              onPress={handleRegister}
              className="w-full py-3 px-4 rounded-lg shadow-md"
              style={{ backgroundColor: primaryColor }} 
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#000" /> 
              ) : (
                <Text className="text-center text-black font-bold text-lg">
                  {customerVerified ? 'Complete Registration' : 'Register'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-2 pb-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/vendor/login" asChild>
              <Text className="font-semibold" style={{ color: primaryColor }}>Login</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* --- PICKER MODALS (No dark classes) --- */}

      {/* Category Modal */}
      {/* <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-center items-center bg-black/50 p-4"
          activeOpacity={1}
          onPressOut={() => setShowCategoryModal(false)}
        >
          <View 
            className="w-full max-w-sm bg-white rounded-lg shadow-lg max-h-[60%]"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">Select Category</Text>
            <ScrollView>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    handleChange('category', cat.id);
                    setShowCategoryModal(false);
                  }}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className="text-base text-gray-800">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-base font-medium" style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal> */}

      

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-center items-center bg-black/50 p-4"
          activeOpacity={1}
          onPressOut={() => setShowGenderModal(false)}
        >
          <View 
            className="w-full max-w-sm bg-white rounded-lg shadow-lg"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">Select Gender</Text>
            <View>
              {[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }].map(item => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    handleChange('gender', item.value);
                    setShowGenderModal(false);
                  }}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className="text-base text-gray-800">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-base font-medium" style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}