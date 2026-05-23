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
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
    opacity: 0.85,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
