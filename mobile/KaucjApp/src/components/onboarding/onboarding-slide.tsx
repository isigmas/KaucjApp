import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { OnboardingData } from "@/src/types";

interface Props {
  item: OnboardingData;
  index: number;
  scrollX: SharedValue<number>;
}

export const OnboardingSlide = ({ item, index, scrollX }: Props) => {
  const { width } = useWindowDimensions();

  //  range where this specific slide is visible
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  //  image scales up and fades in
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [-100, 0, -100],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  // text slides in from the side faster than the image
  const textStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.8, 0, -width * 0.8],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [-0.2, 1, -0.2],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        {item.animation ? (
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : (
          <View style={styles.placeholderBox} />
        )}
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 0.65,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    paddingBottom: 40,
  },
  lottie: {
    width: "80%",
    aspectRatio: 1,
  },
  placeholderBox: {
    width: 250,
    height: 250,
    backgroundColor: "#F3F4F6",
    borderRadius: 125,
  },
  textContainer: {
    flex: 0.35,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
});
