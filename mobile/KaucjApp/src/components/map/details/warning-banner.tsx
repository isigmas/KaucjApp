import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";

interface WarningBannerProps {
  message: string;
  accentColor: string;
}

export default function WarningBanner({
  message,
  accentColor,
}: WarningBannerProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.main,
    padding: spacing.md,
    borderRadius: rounded.xl,
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
  },
  text: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
});
