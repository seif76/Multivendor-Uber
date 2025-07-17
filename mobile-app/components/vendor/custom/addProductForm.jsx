import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function AddProductForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = () => {
    const data = { name, price, description, category, stock, image };

    // Optional: Basic validation
    if (!name || !price) {
      Alert.alert('Validation', 'Name and price are required');
      return;
    }

    onSubmit(data);

    // ✅ Clear form after submit
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setStock('');
    setImage('');
  };

  return (
    <View className="gap-4">
      <TextInput placeholder="Name" value={name} onChangeText={setName} className="border p-2 rounded" />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="border p-2 rounded" />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="border p-2 rounded" />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} className="border p-2 rounded" />
      <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" className="border p-2 rounded" />
      <TextInput placeholder="Image URL" value={image} onChangeText={setImage} className="border p-2 rounded" />

      <Pressable onPress={handleSubmit} className="bg-primary py-3 rounded">
        <Text className="text-white text-center font-semibold">Add Product</Text>
      </Pressable>
    </View>
  );
}
