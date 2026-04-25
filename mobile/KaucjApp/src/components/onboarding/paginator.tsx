import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingData } from "@/src/types";

interface Props {
  data: OnboardingData[];
  scrollX: SharedValue<number>;
}

export const Paginator = ({ data, scrollX }: Props) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [10, 24, 10], // Inactive width: 10, Active width: 24
            Extrapolation.CLAMP,
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP,
          );

          const backgroundColor = interpolateColor(scrollX.value, inputRange, [
            "#D1D5DB",
            "#2563EB",
            "#D1D5DB",
          ]);

          return {
            width: dotWidth,
            opacity,
            backgroundColor,
          };
        });

        return (
          <Animated.View
            style={[styles.dot, animatedDotStyle]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
