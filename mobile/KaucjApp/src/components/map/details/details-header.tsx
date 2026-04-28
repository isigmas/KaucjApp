import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export default function DetailHeader({
  title,
  subtitle,
  rightSlot,
}: DetailHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  rightSlot: {
    position: "relative",
    zIndex: 10,
  },
});
