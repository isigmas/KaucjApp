import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";

interface ComplaintSectionProps {
  title: string;
  hint: string;
  children: React.ReactNode;
}

export default function ComplaintSection({
  title,
  hint,
  children,
}: ComplaintSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    letterSpacing: 0.1,
  },
  hint: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
});
