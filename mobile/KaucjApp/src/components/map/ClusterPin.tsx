import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/src/theme";

interface ClusterPinProps {
  /** Sum of bottles across all merged ads */
  totalBottles: number;
  /** Number of individual ads in this cluster */
  adCount: number;
}

export function ClusterPin({ totalBottles, adCount }: ClusterPinProps) {
  const size = adCount >= 10 ? 56 : adCount >= 5 ? 50 : 44;

  return (
    <View style={styles.container}>
      <View
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.count} numberOfLines={1}>
          {totalBottles}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          szt.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: colors.text.white,
  },
  count: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  label: {
    color: colors.text.white,
    fontSize: 9,
    fontWeight: "500",
    opacity: 0.85,
    lineHeight: 11,
  },
});
