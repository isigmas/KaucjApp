import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Store, MapPin } from "lucide-react-native";
import { colors, shadows, spacing } from "@/src/theme";

export interface MachineQuickStatsProps {
  networkName: string;
  status: "OPEN" | "CLOSED" | string;
  address: string;
}

export default function MachineQuickStats({
  networkName,
  status,
  address,
}: MachineQuickStatsProps) {
  const isOpen = status.toUpperCase() === "OPEN";

  const formatShortAddress = (fullAddress: string) => {
    const parts = fullAddress.trim().split(" ");
    if (parts.length > 2) {
      return parts.slice(-2).join(" ");
    }
    return fullAddress;
  };

  return (
    <View style={styles.container}>
      <StatItem
        index={1}
        icon={<Store size={22} color={colors.accent.dark} strokeWidth={2.5} />}
        iconBg={colors.background.card}
        value={networkName}
        label="Sieć"
      />

      <StatItem
        index={2}
        icon={<MapPin size={22} color={colors.accent.dark} strokeWidth={2.5} />}
        iconBg={colors.background.card}
        value={formatShortAddress(address)}
        label="Lokalizacja"
      />
    </View>
  );
}

// --- Internal Subcomponent ---

interface StatItemProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  valueColor?: string;
  index: number;
}

function StatItem({
  icon,
  iconBg,
  value,
  label,
  valueColor,
  index,
}: StatItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.statWrapper}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text
        style={[styles.valueText, valueColor && { color: valueColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.lg,
    width: "100%",
  },
  statWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text?.primary || "#1C1C1E",
    marginBottom: 4,
    textAlign: "center",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text?.muted || "#8E8E93",
    textAlign: "center",
  },
});
