import { Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import Animated, { FadeIn } from "react-native-reanimated";
import { layoutSpring } from "@/src/constants";
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
  return currentStep !== 3 ? (
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
      <Pressable style={[styles.button]} onPress={onNext}>
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
  ) : (
    <Animated.View
      entering={FadeIn.duration(800).delay(100)}
      layout={layoutSpring}
      style={styles.finalContainer}
    >
      <Pressable style={styles.buttonSecondary} onPress={onPrevious}>
        <Text style={styles.buttonTextSecondary}>Edytuj ofertę</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  finalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100,
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
    ...shadows.light,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  buttonSecondary: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  buttonTextSecondary: {
    color: colors.text.secondary,
    fontWeight: "600",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
