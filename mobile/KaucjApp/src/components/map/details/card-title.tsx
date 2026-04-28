import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";

interface SectionTitleProps {
  children: React.ReactNode;
}

export default function CardTitle({ children }: SectionTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
});
