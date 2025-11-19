import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  // Removed Platform and Keyboard to adhere to the constraint
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";

// Define primary color for better readability and consistency
const PRIMARY_COLOR = "#007233"; 
const LIGHT_BG = "#E8F5E9"; 

export default function EditVendorProfile() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  
  // User info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");

  // Shop info
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const router = useRouter();

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const decoded = jwtDecode(token);

        const res = await axios.get(
          `${BACKEND_URL}/api/vendor/get-by-phone?phone_number=${decoded?.phone_number}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const vendorData = res.data;
        setVendor(vendorData);

        // Set user info
        setName(vendorData.user?.name || "");
        setEmail(vendorData.user?.email || "");
        setGender(vendorData.user?.gender || "");
        setPhoneNumber(vendorData.user?.phone_number || "");

        // Set shop info
        setShopName(vendorData.info?.shop_name || "");
        setShopLocation(vendorData.info?.shop_location || "");
        setOwnerName(vendorData.info?.owner_name || "");
      } catch (err) {
        console.error("Error loading vendor:", err);
        Alert.alert("Error", "Failed to load vendor info");
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      // 1️⃣ Update user basic info
      await axios.put(
        `${BACKEND_URL}/api/vendor/edit`,
        {
          phone_number: phoneNumber,
          user: { name, email, gender },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ Update shop info
      await axios.put(
        `${BACKEND_URL}/api/vendor/update-profile`,
        {
          shop_name: shopName,
          shop_location: shopLocation,
          owner_name: ownerName,
          phone_number: phoneNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Vendor profile updated successfully");
      router.back();
    } catch (err) {
      console.error("Error updating vendor profile:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    );
  }

  // Helper component for styled text input with icon
  const StyledTextInput = ({ label, value, onChangeText, icon, keyboardType, editable = true, placeholder }) => (
    <View>
      <Text className="text-gray-600 font-medium mb-2">{label}</Text>
      <View className={`flex-row items-center border rounded-xl px-4 py-2 ${editable ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'}`}>
        <MaterialIcons name={icon} size={20} color={editable ? '#7f8c8d' : '#bdc3c7'} className="mr-3" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#95a5a6"
          className="flex-1 text-base text-gray-800 ml-2"
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header and Back Button */}
      <View className="flex-row items-center pt-16 pb-4 px-6 bg-white border-b border-gray-100 shadow-md">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-6"
        >
          <Ionicons name="arrow-back" size={26} color={PRIMARY_COLOR} />
        </Pressable>
        <Text className="flex-1 text-xl font-bold text-center text-gray-800">
          Edit Vendor Profile
        </Text>
      </View>

      {/* FIX: The key change is adding a large padding to the ScrollView contentContainerStyle. 
              This manually creates the space needed to lift the content above the keyboard. */}
      <ScrollView 
        className="px-6 pt-4"
        contentContainerStyle={{ 
            paddingBottom: 250, // Increased padding to ensure fields are visible above the keyboard
        }}
        // Ensures the view scrolls when tapping an input
        keyboardShouldPersistTaps="handled" 
      >
        {/* User Info Section */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm" style={{ elevation: 3 }}>
          <View className="flex-row items-center mb-5">
            <MaterialIcons name="person-outline" size={24} color={PRIMARY_COLOR} />
            <Text className="text-lg font-bold ml-2" style={{ color: PRIMARY_COLOR }}>
              Personal Information
            </Text>
          </View>

          <View className="space-y-5">
            <StyledTextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="badge"
              placeholder="Your full name"
            />
            
            <StyledTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              icon="email"
              keyboardType="email-address"
              placeholder="Your email address"
            />

            <StyledTextInput
              label="Phone Number"
              value={phoneNumber}
              editable={false}
              icon="phone"
            />
          </View>
          
          {/* Gender Selection */}
          <View className="mt-5">
            <Text className="text-gray-600 font-medium mb-3">Gender</Text>
            <View className="flex-row space-x-3">
              {["male", "female"].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setGender(option)}
                  className={`flex-1 border rounded-xl p-3 items-center ${
                    gender === option
                      ? "border-primary bg-primary/10"
                      : "border-gray-300"
                  }`}
                  style={gender === option ? { borderColor: PRIMARY_COLOR, backgroundColor: LIGHT_BG } : {}}
                >
                  <Text
                    className={`font-semibold ${
                      gender === option ? "text-primary" : "text-gray-600"
                    }`}
                    style={gender === option ? { color: PRIMARY_COLOR } : {}}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Shop Info Section */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm" style={{ elevation: 3 }}>
          <View className="flex-row items-center mb-5">
            <MaterialIcons name="storefront" size={24} color={PRIMARY_COLOR} />
            <Text className="text-lg font-bold ml-2" style={{ color: PRIMARY_COLOR }}>
              Shop Information
            </Text>
          </View>

          <View className="space-y-5">
            <StyledTextInput
              label="Shop Name"
              value={shopName}
              onChangeText={setShopName}
              icon="shop"
              placeholder="The official name of your shop"
            />

            <StyledTextInput
              label="Shop Location"
              value={shopLocation}
              onChangeText={setShopLocation}
              icon="location-on"
              placeholder="Physical or main service location"
            />

            <StyledTextInput
              label="Owner Name"
              value={ownerName}
              onChangeText={setOwnerName}
              icon="verified-user"
              placeholder="Name of the shop owner/manager"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4 mt-4 items-center" 
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}