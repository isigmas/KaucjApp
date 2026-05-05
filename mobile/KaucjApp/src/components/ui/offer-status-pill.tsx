import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { rounded, spacing } from "@/src/theme";
import { OfferStatus } from "@/src/types";
import { getOfferStatusConfig } from "@/src/lib";

interface OfferSatusPillProps {
  status: OfferStatus;
}

export default function OfferSatusPill({ status }: OfferSatusPillProps) {
  const { color: statusColor, label: statusLabel } =
    getOfferStatusConfig(status);
  return (
    <View style={[styles.statusPill, { backgroundColor: statusColor + "1A" }]}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.statusLabel, { color: statusColor }]}>
        {statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
