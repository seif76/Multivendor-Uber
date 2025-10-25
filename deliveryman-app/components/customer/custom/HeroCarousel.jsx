import React from "react";
import { View, Image, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const banners = [
  { id: 1, image:  "https://img.freepik.com/free-vector/cosmetic-realistic-vector-background_88138-57.jpg" },
  { id: 2, image: "https://img.freepik.com/free-vector/cosmetic-realistic-vector-background_88138-57.jpg" },
  { id: 3, image: "https://img.freepik.com/free-vector/cosmetic-realistic-vector-background_88138-57.jpg" },
];

export default function HeroCarousel() {
  return (
    <View className="mt-4 mb-2">
      <Carousel
        loop
        width={width}
        height={160}
        autoPlay={true}
        data={banners}
        scrollAnimationDuration={1500}
        renderItem={({ item }) => (
          <View className="rounded-2xl overflow-hidden mx-2 shadow-md">
              <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
}
