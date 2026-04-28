import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { rounded, spacing } from "@/src/theme";
import { OfferStatus } from "@/src/types";
import { getOfferStatusConfig } from "@/src/lib";

interface StatusBadgeProps {
  status: OfferStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { color, label } = getOfferStatusConfig(status);
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rounded.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#fff",
  },
});
