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
import { colors } from "@/src/theme";

interface Props {
  data: OnboardingData[];
  scrollX: SharedValue<number>;
}

export const Paginator = ({ data, scrollX }: Props) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        // Determine if this is the final "Start" slide
        const isLastDot = i === data.length - 1;
        const activeColor = isLastDot
          ? colors.primary.dark
          : colors.black.default;

        const animatedDotStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [10, 24, 10],
            Extrapolation.CLAMP,
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP,
          );

          // The dot morphs from gray to its specific activeColor (Black or Primary Dark)
          const backgroundColor = interpolateColor(scrollX.value, inputRange, [
            "#D1D5DB",
            activeColor,
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
    justifyContent: "center",

    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
