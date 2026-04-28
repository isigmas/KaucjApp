import React from "react";
import { Pressable, Text, StyleSheet, Alert } from "react-native";
import { useAppStore } from "@/src/state/app-store";
import { colors } from "@/src/theme";

export const ResetOnboardingButton = () => {
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);

  const handleReset = async () => {
    try {
      await resetOnboarding();
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={handleReset}
    >
      <Text style={styles.text}>Resetuj onboarding</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.status.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
