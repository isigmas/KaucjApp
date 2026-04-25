import React from "react";
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  interpolate,
  Extrapolation,
  SharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  scrollX: SharedValue<number>;
  totalSlides: number;
}

export const OnboardingButton = ({ onPress, scrollX, totalSlides }: Props) => {
  const { width } = useWindowDimensions();
  const lastIndex = totalSlides - 1;

  // ANIMATION: Morph Button Color & Scale
  const buttonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      ["#0F172A", "#10B981"], // Premium Slate to Kaucjapp Green
    );

    const scale = interpolate(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [1, 1.05], // Subtle growth on the final slide
      Extrapolation.CLAMP,
    );

    return {
      backgroundColor,
      transform: [{ scale: withSpring(scale) }],
    };
  });

  // ANIMATION: Slide & Fade "Continue" Text (Exit Up)
  const continueTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [0, -25],
      Extrapolation.CLAMP,
    );

    return { opacity, transform: [{ translateY }] };
  });

  // ANIMATION: Slide & Fade "Start Building" Text (Enter from Bottom)
  const startTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [25, 0],
      Extrapolation.CLAMP,
    );

    return { opacity, transform: [{ translateY }] };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.button, buttonStyle]}
    >
      <View style={styles.textStack}>
        <Animated.Text style={[styles.buttonText, continueTextStyle]}>
          Continue
        </Animated.Text>
        <Animated.Text
          style={[styles.buttonText, styles.absoluteText, startTextStyle]}
        >
          Start
        </Animated.Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Clips the sliding text
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  textStack: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  absoluteText: {
    position: "absolute",
  },
});
