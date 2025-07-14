import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

const dummyShop = {
  logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
  banner:
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
  store_name: 'Venus',
  category: 'Electronics, Grocery, Specialty Store',
  rating: 4.4,
  ratingCount: 68,
  deliveryTime: '20 - 30 mins',
  deliveryFee: 18.99,
  tabs: ['Picks for you 🔥', '3 Steps Bulbs', 'Venus led bulbs'],
  products: [
    {
      id: '1',
      name: 'Plug Extension 4 Mk With Main Switch 10 Amp 60 Cm',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      price: 468,
    },
    {
      id: '2',
      name: 'Iphone Cable 2.1 Amp 2 Meters 400730',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      price: 206,
    },
    {
      id: '3',
      name: 'Fast Type-C Cable Silver 2.4 Amp 2 M',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      price: 281,
      label: 'Top rated',
    },
    {
      id: '4',
      name: 'Venus Bulb Screw 11 Watts Yellow',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      price: 104,
    },
  ],
};

export default function ShopDetails() {
  const { phone_number } = useLocalSearchParams();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(dummyShop.tabs[0]);

  return (
    <ScrollView className="bg-white">
      {/* Header */}
      <View className="relative">
        <Image
          source={{ uri: dummyShop.banner }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <Pressable
          onPress={() => router.back()}
          className="absolute top-10 left-4 bg-white p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
      </View>

      {/* Shop Info */}
      <View className="bg-white mx-auto w-[85%] -mt-10 px-6  pt-4 rounded-t-3xl rounded-b-3xl shadow">
        <View className="flex-row items-center">
          <Image
            source={{ uri: dummyShop.logo }}
            className="w-14 h-14 rounded-md mr-3"
          />
          <View>
            <Text className="text-xl text-primary font-bold">{dummyShop.store_name}</Text>
            <Text className="text-xs text-primary ">{dummyShop.category}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-yellow-500">⭐ {dummyShop.rating}</Text>
              <Text className="text-xs text-primary  ml-1">
                ({dummyShop.ratingCount})
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap mt-4 items-center gap-2">
          <Text className="text-sm text-primary ">{dummyShop.deliveryTime}</Text>
          <Text className="text-sm text-primary ">• 🚴 EGP {dummyShop.deliveryFee}</Text>
          <Text className="text-sm text-primary ">• Delivered by you</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-8 mb-4 px-4"
      >
        {dummyShop.tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelectedTab(tab)}
            className={`mr-4  pb-2 border-b-2 ${
              selectedTab === tab ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm  font-medium ${
                selectedTab === tab ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-bold mb-5">{selectedTab}</Text>

        <FlatList
          data={dummyShop.products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View className="w-[48%] bg-white mb-4 rounded-xl overflow-hidden shadow">
              <Image
                source={{ uri: item.image }}
                className="w-full h-28"
                resizeMode="cover"
              />
              <View className="p-2">
                <Text className="font-semibold text-sm" numberOfLines={2}>
                  {item.name}
                </Text>
                <Text className="text-primary font-bold text-sm mt-1">
                  EGP {item.price.toFixed(2)}
                </Text>
                {item.label && (
                  <Text className="text-[10px] text-orange-500 mt-1 bg-orange-100 px-1 rounded">
                    ⭐ {item.label}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      </View>

      {/* Bottom Note */}
      <View className="items-center justify-center mb-10">
        <Text className="text-sm text-gray-500">
          Add EGP 50.00 to start your order
        </Text>
      </View>
    </ScrollView>
  );
}
