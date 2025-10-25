import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");

  // Vehicle Info
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const router = useRouter();

  // ✅ Load profile and vehicle data from ONE endpoint
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const { data } = await axios.get(
          `${BACKEND_URL}/api/deliveryman/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Basic info
        setName(data.name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phone_number || "");
        setGender(data.gender || "");

        // ✅ Vehicle info (if included in profile data)
        if (data.vehicle || data.delivery_vehicle) {
          const v = data.vehicle || data.delivery_vehicle;
          setVehicleType(v.vehicle_type || v.type || "");
          setVehicleModel(v.model || "");
          setVehicleColor(v.color || "");
          setLicensePlate(v.license_plate || "");
          setVehicleYear(v.year?.toString() || "");
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ✅ Handle Save — send two separate PUT requests
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      // Update basic info
      await axios.put(
        `${BACKEND_URL}/api/deliveryman/update-profile`,
        { name, email, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update vehicle info
      await axios.put(
        `${BACKEND_URL}/api/deliveryman/update-vehicle`,
        {
          vehicle_type: vehicleType,
          model: vehicleModel,
          color: vehicleColor,
          license_plate: licensePlate,
          year: vehicleYear,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
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
        Edit Profile
      </Text>

      {/* Personal Information */}
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

      {/* Vehicle Information */}
      <View className="bg-gray-50 rounded-2xl p-5 shadow-sm mb-8">
        <Text className="text-lg font-semibold text-primary mb-4">
          Vehicle Information
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-1">Vehicle Type</Text>
            <TextInput
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="e.g. Car, Motorcycle"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Model</Text>
            <TextInput
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="Vehicle model"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Color</Text>
            <TextInput
              value={vehicleColor}
              onChangeText={setVehicleColor}
              placeholder="Vehicle color"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">License Plate</Text>
            <TextInput
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="License plate number"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Year</Text>
            <TextInput
              value={vehicleYear}
              onChangeText={setVehicleYear}
              keyboardType="numeric"
              placeholder="Year of manufacture"
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
