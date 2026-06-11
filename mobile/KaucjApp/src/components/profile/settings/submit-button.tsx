import React, { useEffect } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
  Extrapolation,
  interpolate,
} from "react-native-reanimated";
import { colors, rounded, shadows, spacing } from "@/src/theme";

interface AnimatedSaveButtonProps {
  text: string;
  onPress: () => void;
  isPending: boolean;
  isSuccess: boolean;
  isSaveDisabled: boolean;
}

export const AnimatedSaveButton: React.FC<AnimatedSaveButtonProps> = ({
  text,
  onPress,
  isPending,
  isSuccess,
  isSaveDisabled,
}) => {
  const { width: windowWidth } = useWindowDimensions();

  const paddingHorizontal = spacing.md;
  const initialWidth = windowWidth - paddingHorizontal * 2;
  const circleSize = 54;

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(isSuccess ? 1 : 0, {
      duration: 400,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [isSuccess]);

  const animatedButtonStyles = useAnimatedStyle(() => {
    const currentWidth =
      animationProgress.value * (circleSize - initialWidth) + initialWidth;
    const currentRadius =
      animationProgress.value * (circleSize / 2 - rounded.apple) +
      rounded.apple;

    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [
        isSaveDisabled
          ? isPending
            ? colors.primary.base
            : colors.background.disabled
          : colors.primary.base,
        colors.status.success,
      ],
    );

    const scale = interpolate(animationProgress.value, [0, 1], [1, 1.2]);

    return {
      width: currentWidth,
      borderRadius: currentRadius,
      backgroundColor: backgroundColor,
      transform: [{ scale }],
    };
  });

  const animatedCheckmarkStyles = useAnimatedStyle(() => ({
    opacity: withTiming(isSuccess ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withTiming(isSuccess ? 1 : 0.5, { duration: 250 }) }],
  }));

  return (
    <View style={styles.buttonCenteringContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Animated.View style={[styles.saveButton, animatedButtonStyles]}>
          {isPending ? (
            <ActivityIndicator color={colors.text.white} />
          ) : isSuccess ? (
            <Animated.View
              style={[
                styles.checkmarkAbsoluteContainer,
                animatedCheckmarkStyles,
              ]}
            >
              <Text style={styles.checkmarkIcon}>✓</Text>
            </Animated.View>
          ) : (
            <Animated.Text style={[styles.saveButtonText]}>
              {text}
            </Animated.Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonCenteringContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.light,
  },
  saveButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
    position: "absolute",
  },
  checkmarkAbsoluteContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkIcon: {
    color: colors.text.white,
    fontSize: 22,
    fontWeight: "bold",
  },
});
