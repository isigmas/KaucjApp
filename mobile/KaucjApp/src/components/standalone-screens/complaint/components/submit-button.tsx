import React from "react";
import { StyleSheet, Text, ActivityIndicator, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";
import { Feather } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SubmitButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export default function SubmitButton({
  onPress,
  isLoading,
}: SubmitButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isLoading) onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isLoading}
      style={[styles.button, animatedStyle]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text.white} />
      ) : (
        <>
          <Feather name="send" size={17} color={colors.text.white} />
          <Text style={styles.text}>Wyślij zgłoszenie</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: colors.primary.dark,
    borderRadius: rounded.apple,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    gap: spacing.xs,
  },
  text: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
