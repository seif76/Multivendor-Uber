import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Enable smooth expand animation
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === key ? null : key);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("cart");
    await AsyncStorage.removeItem("cart_vendor_id");
    router.push("/");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-4 text-gray-500 text-lg">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 text-lg">No user data found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f8f6]">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Card */}
        <View className="bg-white p-4 shadow-sm">
          <View className="flex-row items-center gap-4">
            {user.profile_photo ? (
              <Image
                source={{ uri: user.profile_photo }}
                className="h-16 w-16 rounded-full border border-gray-300"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person-outline" size={28} color="#777" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#333]">{user.name}</Text>
              <Text className="text-sm text-gray-500">{user.phone_number || "N/A"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/customer/EditProfilePage")}
              className="p-2 rounded-full bg-[#4CAF50]/10"
            >
              <Ionicons name="create-outline" size={22} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Data */}
        <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => toggleSection("profileData")}
          >
            <View className="flex size-10 items-center justify-center rounded-lg bg-[#4CAF50]/10">
              <Ionicons name="person-circle-outline" size={22} color="#4CAF50" />
            </View>
            <Text className="flex-1 text-[#333] font-medium">Profile Data</Text>
            <Ionicons
              name={expandedSection === "profileData" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>

          {expandedSection === "profileData" && (
            <View className="px-5 py-4 space-y-3">
              {[
                { label: "Name", value: user.name, icon: "person-outline" },
                { label: "Email", value: user.email, icon: "mail-outline" },
                { label: "Phone", value: user.phone_number, icon: "call-outline" },
                {
                  label: "Gender",
                  value: user.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "N/A",
                  icon: "male-female-outline",
                },
              ].map((item, index) => (
                <View key={index} className="flex-row items-center">
                  <Ionicons name={item.icon} size={18} color="#4CAF50" />
                  <Text className="ml-3 text-gray-700 font-medium flex-1">
                    {item.label}: <Text className="font-normal">{item.value || "N/A"}</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Expandable Sections */}
        {[
          { key: "rewards", title: "Rewards (Points)", icon: "trophy-outline" },
          { key: "orders", title: "Previous Orders", icon: "bag-handle-outline" },
          { key: "trips", title: "Previous Trips", icon: "car-outline" },
          { key: "wallet", title: "Wallet", icon: "wallet-outline" },
          { key: "invite", title: "Invite Friends", icon: "gift-outline" },
          { key: "vouchers", title: "Vouchers", icon: "pricetag-outline" },
          { key: "pro", title: "Pro Features", icon: "diamond-outline" },
          { key: "addresses", title: "Manage Addresses", icon: "home-outline" },
          { key: "support", title: "Support & Help", icon: "help-circle-outline" },
          { key: "about", title: "About App", icon: "information-circle-outline" },
        ].map((item) => (
          <View key={item.key} className="mt-4 mx-4 bg-white rounded-xl shadow-md">
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
              onPress={() =>
                item.key === "wallet"
                  ? router.push("../wallet")
                  : toggleSection(item.key)
              }
            >
              <View className="flex size-10 items-center justify-center rounded-lg bg-[#4CAF50]/10">
                <Ionicons name={item.icon} size={22} color="#4CAF50" />
              </View>
              <Text className="flex-1 text-[#333] font-medium">{item.title}</Text>
              <Ionicons
                name={expandedSection === item.key ? "chevron-up" : "chevron-down"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>

            {expandedSection === item.key && item.key !== "wallet" && (
              <View className="px-4 py-3">
                {item.key === "rewards" && (
                  <Text className="text-gray-700">You have 1250 reward points 🎉</Text>
                )}
                {item.key === "orders" && (
                  <Text className="text-gray-700">You placed 12 orders.</Text>
                )}
                {item.key === "trips" && (
                  <Text className="text-gray-700">Completed 8 trips.</Text>
                )}
                {item.key === "invite" && (
                  <Text className="text-gray-700">
                    Invite friends and earn LYD 1 per invite!
                  </Text>
                )}
                {item.key === "vouchers" && (
                  <Text className="text-gray-700">You currently have 0 vouchers.</Text>
                )}
                {item.key === "pro" && (
                  <Text className="text-gray-700">
                    Upgrade to Pro for exclusive benefits.
                  </Text>
                )}
                {item.key === "addresses" && (
                  <Text className="text-gray-700">
                    Manage your saved delivery addresses here.
                  </Text>
                )}
                {item.key === "support" && (
                  <Text className="text-gray-700">
                    Contact support@myapp.com for assistance.
                  </Text>
                )}
                {item.key === "about" && (
                  <Text className="text-gray-700">App version 1.0.0</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Logout */}
        <View className="px-4 mt-6 mb-10">
          <TouchableOpacity
            className="flex-row w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-3"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
