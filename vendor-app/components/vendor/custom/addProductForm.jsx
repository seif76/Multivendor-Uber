import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const PRIMARY = "#007233";

export default function AddProductForm({
  onSubmit,
  categories = [],
  submitText = "Save Product",
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [vendorCategoryId, setVendorCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !price) {
      Alert.alert("Validation", "Name and price are required");
      return;
    }
    if (!image || !image.uri) {
      Alert.alert("Validation", "Product image is required");
      return;
    }
    const data = {
      name,
      price,
      description,
      category: vendorCategoryId || null,
      stock,
      image,
    };
    setLoading(true);
    onSubmit(data).then(() => {
      setName("");
      setPrice("");
      setDescription("");
      setVendorCategoryId("");
      setStock("");
      setImage(null);
      setLoading(false);
    });
  };

  const pickImage = async (setter) => {
    setImageError("");
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setImageError("Permission to access media library is required!");
        Alert.alert("Permission required", "Please allow access to your photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setter({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
        });
      } else {
        setter(null);
      }
    } catch (err) {
      setImageError("Failed to pick image.");
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === vendorCategoryId);

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
    >
      <View className="space-y-5">

        {/* ── Product Image ── */}
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Product Image</Text>
          </View>
          <View className="p-4 items-center">
            {image?.uri ? (
              <View className="items-center gap-3">
                <Image
                  source={{ uri: image.uri }}
                  className="w-36 h-36 rounded-2xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => pickImage(setImage)}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-gray-200"
                >
                  <Ionicons name="refresh-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 font-medium">Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center gap-3 py-4">
                <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: `${PRIMARY}15` }}>
                  <Ionicons name="image-outline" size={32} color={PRIMARY} />
                </View>
                <View className="items-center">
                  <Text className="font-semibold text-gray-700">Upload product image</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">JPG or PNG · Required</Text>
                </View>
                <TouchableOpacity
                  onPress={() => pickImage(setImage)}
                  className="px-6 py-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Text className="text-white font-bold text-sm">Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
            {imageError ? (
              <Text className="text-red-500 text-xs mt-2 text-center">{imageError}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Product Details ── */}
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Product Details</Text>
          </View>
          <View className="p-4 space-y-4">

            {/* Name */}
            <View>
              <Text className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Product Name <Text className="text-red-400">*</Text>
              </Text>
              <TextInput
                placeholder="e.g. Luxury cotton shirt"
                value={name}
                onChangeText={setName}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Description</Text>
              <TextInput
                placeholder="Describe your product..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                style={{ minHeight: 110 }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Price & Stock */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Price <Text className="text-red-400">*</Text>
                </Text>
                <View className="relative">
                  <TextInput
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-14 text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <View className="absolute right-3 top-0 bottom-0 justify-center">
                    <Text className="text-gray-400 font-semibold text-xs">LYD</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Stock</Text>
                <TextInput
                  placeholder="0"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Category ── */}
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Category</Text>
          </View>
          <View className="p-4">
            <Pressable
              onPress={() => setCategoryModal(true)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
            >
              <Text className={selectedCategory ? "text-gray-900 font-medium" : "text-gray-400"}>
                {selectedCategory ? selectedCategory.name : "Select a category..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* ── Submit Button ── */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="mt-2 h-14 rounded-2xl items-center justify-center shadow-md"
          style={{ backgroundColor: loading ? '#9ca3af' : PRIMARY }}
        >
          {loading ? (
            <View className="flex-row items-center gap-2">
              <Ionicons name="hourglass-outline" size={18} color="white" />
              <Text className="text-white font-bold text-base">Saving...</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base">{submitText}</Text>
            </View>
          )}
        </Pressable>

      </View>

      {/* ── Category Modal ── */}
      <Modal visible={categoryModal} transparent animationType="slide">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setCategoryModal(false)}
        >
          <View
            className="bg-white rounded-t-3xl p-5"
            onStartShouldSetResponder={() => true}
          >
            <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-4" />
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Category</Text>

            {categories.length === 0 ? (
              <Text className="text-gray-400 text-center py-6">No categories found.</Text>
            ) : (
              categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setVendorCategoryId(cat.id);
                    setCategoryModal(false);
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                    vendorCategoryId === cat.id ? 'bg-[#00A98F]' : 'bg-gray-50'
                  }`}
                >
                  <Text className={`text-base font-medium ${
                    vendorCategoryId === cat.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {cat.name}
                  </Text>
                  {vendorCategoryId === cat.id && (
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  )}
                </Pressable>
              ))
            )}

            <TouchableOpacity
              onPress={() => setCategoryModal(false)}
              className="mt-2 py-3 items-center"
            >
              <Text className="text-gray-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </KeyboardAwareScrollView>
  );
}