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
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

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
        Alert.alert(
          "Permission required",
          "Please allow access to your photos."
        );
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

  const selectedCategory = categories.find(
    (cat) => cat.id === vendorCategoryId
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full px-4 mt-4 pb-32 space-y-6">

        {/* Product Images */}
        <View>
          <Text className="text-lg font-bold mb-2">Product Images</Text>

          <View className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6">
            <View className="flex items-center justify-center w-14 h-14 rounded-full bg-[#00A98F]/10 mb-3">
              <Ionicons name="images" size={32} color="#00A98F" />
            </View>

            {image?.uri ? (
              <Image
                source={{ uri: image.uri }}
                className="w-32 h-32 rounded-xl mb-3"
              />
            ) : (
              <>
                <Text className="font-semibold text-center">
                  Tap below to upload product image
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Only 1 image is required
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={() => pickImage(setImage)}
              className="bg-[#00A98F] mt-3 px-6 h-10 rounded-full items-center justify-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm">Upload Image</Text>
            </TouchableOpacity>

            {imageError ? (
              <Text className="text-red-500 text-xs mt-2">{imageError}</Text>
            ) : null}
          </View>
        </View>

        {/* Product Name */}
        <View>
          <Text className="text-sm font-medium mb-1">Product Name</Text>
          <TextInput
            placeholder="Luxury cotton shirt"
            value={name}
            onChangeText={setName}
            className="w-full bg-white border border-gray-300 rounded-xl p-3"
          />
        </View>

        {/* Description */}
        <View>
          <Text className="text-sm font-medium mb-1">Description</Text>
          <TextInput
            placeholder="Enter detailed product description..."
            value={description}
            onChangeText={setDescription}
            multiline
            className="w-full min-h-[120px] bg-white border border-gray-300 rounded-xl p-3"
          />
        </View>

        {/* Price & Stock */}
        <View className="flex-row w-full gap-4">
          <View className="flex-1">
            <Text className="text-sm font-medium mb-1">Price</Text>
            <View className="relative">
              <TextInput
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-10"
              />
              <Text className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                LYD
              </Text>
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium mb-1">Stock</Text>
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
              className="w-full bg-white border border-gray-300 rounded-xl p-3"
            />
          </View>
        </View>

        {/* Category */}
        <View>
          <Text className="text-sm font-medium mb-1">Category</Text>

          <Pressable
            onPress={() => setCategoryModal(true)}
            className="bg-white border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
          >
            <Text className={selectedCategory ? "text-black" : "text-gray-400"}>
              {selectedCategory ? selectedCategory.name : "Select Category"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Category Modal */}
        <Modal visible={categoryModal} transparent animationType="fade">
          <Pressable
            className="flex-1 bg-black/30 justify-center items-center"
            onPress={() => setCategoryModal(false)}
          >
            <View className="bg-white w-[85%] max-h-[60%] rounded-2xl p-4">
              <Text className="text-lg font-bold mb-4 text-[#00A98F]">
                Select Category
              </Text>

              <ScrollView>
                {categories.length === 0 ? (
                  <Text className="text-gray-500 text-center">
                    No categories found.
                  </Text>
                ) : null}

                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      setVendorCategoryId(cat.id);
                      setCategoryModal(false);
                    }}
                    className={`p-3 rounded-xl mb-2 ${
                      vendorCategoryId === cat.id
                        ? "bg-[#00A98F]"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        vendorCategoryId === cat.id
                          ? "text-white font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Save Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-[#00A98F] mt-6 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white font-bold text-lg">
            {loading ? "Saving..." : submitText}
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
} 