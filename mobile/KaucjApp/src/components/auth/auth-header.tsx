import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
});
