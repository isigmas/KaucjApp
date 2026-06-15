import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { colors, rounded, spacing } from "@/src/theme";
import Animated, { FadeIn } from "react-native-reanimated";
import { layoutSpring } from "@/src/constants";
import { ArrowRightIcon } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function NavigationButtons({
  currentStep,
  onPrevious,
  onNext,
}: NavigationButtonsProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(800).delay(100)}
      layout={layoutSpring}
      style={styles.container}
    >
      <Pressable
        style={[styles.button, currentStep === 1 && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={currentStep === 1}
      >
        <Text style={styles.buttonText}>
          <Ionicons name="chevron-back" size={16} color={colors.text.white} />{" "}
          Wstecz
        </Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>
          Dalej{" "}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.white}
          />
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
