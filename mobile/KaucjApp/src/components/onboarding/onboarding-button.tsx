import React from "react";
import { View, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  interpolate,
  Extrapolation,
  SharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, rounded } from "@/src/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  scrollX: SharedValue<number>;
  totalSlides: number;
}

export const OnboardingButton = ({ onPress, scrollX, totalSlides }: Props) => {
  const { width } = useWindowDimensions();
  const lastIndex = totalSlides - 1;

  const buttonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [(lastIndex - 1) * width, lastIndex * width],
      [colors.black.default, colors.primary.dark],
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

  //  zaczynamy text style (enters from bottom)
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
          Dalej
        </Animated.Text>
        <Animated.Text
          style={[styles.buttonText, styles.absoluteText, startTextStyle]}
        >
          Zaczynamy!
        </Animated.Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 64,
    borderRadius: rounded.apple,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  textStack: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  absoluteText: {
    position: "absolute",
  },
});
