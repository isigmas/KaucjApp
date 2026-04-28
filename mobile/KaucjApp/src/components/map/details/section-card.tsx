import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";

interface SectionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ children, style }: SectionCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
});
