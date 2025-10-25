import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";

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
        <ActivityIndicator size="large" color="#007233" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-12">
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-6 z-10"
      >
        <Ionicons name="arrow-back" size={26} color="#007233" />
      </Pressable>

      <Text className="text-3xl font-bold text-center text-primary mb-8">
        Edit Vendor Profile
      </Text>

      {/* User Info Section */}
      <View className="bg-gray-50 rounded-2xl p-5 mb-8 shadow-sm">
        <Text className="text-lg font-semibold text-primary mb-4">
          Personal Information
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Phone Number</Text>
            <TextInput
              value={phoneNumber}
              editable={false}
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-400 bg-gray-100"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Gender</Text>
            <View className="flex-row space-x-3 mt-2">
              {["male", "female"].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setGender(option)}
                  className={`flex-1 border rounded-xl p-3 items-center ${
                    gender === option
                      ? "border-primary bg-primary/10"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      gender === option ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Shop Info Section */}
      <View className="bg-gray-50 rounded-2xl p-5 mb-8 shadow-sm">
        <Text className="text-lg font-semibold text-primary mb-4">
          Shop Information
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-1">Shop Name</Text>
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="Enter shop name"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Shop Location</Text>
            <TextInput
              value={shopLocation}
              onChangeText={setShopLocation}
              placeholder="Enter shop location"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Owner Name</Text>
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Enter owner name"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSave}
        className="bg-primary rounded-2xl p-4 mb-12 items-center"
      >
        <Text className="text-white font-semibold text-lg">Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}
