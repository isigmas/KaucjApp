import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wallet, User } from "lucide-react-native";
import { colors } from "@/src/theme";

interface MapHeaderProps {
  /** Displayed wallet balance in PLN */
  balancePLN?: number;
}

export function MapHeader({ balancePLN = 0 }: MapHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.avatar}>
        <User size={22} color={colors.text.white} />
      </View>

      <View style={styles.walletPill}>
        <Wallet size={16} color={colors.text.white} />
        <Text style={styles.walletText}>
          {balancePLN.toFixed(2)} PLN
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
  },
  walletText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
