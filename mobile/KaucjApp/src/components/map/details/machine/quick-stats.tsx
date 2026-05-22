import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Store, MapPin, Power } from "lucide-react-native";
import { colors, shadows, spacing } from "@/src/theme";
import { getMachineStatusConfig } from "@/src/lib";
import { DepositMachineStatus } from "@/src/types";

export interface MachineQuickStatsProps {
  networkName: string;
  status: DepositMachineStatus;
  address: string;
}

export default function MachineQuickStats({
  networkName,
  status,
  address,
}: MachineQuickStatsProps) {
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
        icon={<MapPin size={22} color={colors.accent.dark} strokeWidth={2.5} />}
        iconBg={colors.background.card}
        value={formatShortAddress(address)}
        label="Lokalizacja"
        shadowColor={colors.accent.dark}
      />

      <StatItem
        index={2}
        icon={
          <Power
            size={22}
            color={getMachineStatusConfig(status).color}
            strokeWidth={2.5}
          />
        }
        iconBg={colors.background.card}
        shadowColor={getMachineStatusConfig(status).color}
        value={getMachineStatusConfig(status).label}
        label="Status"
      />

      <StatItem
        index={3}
        icon={<Store size={22} color={colors.accent.dark} strokeWidth={2.5} />}
        iconBg={colors.background.card}
        shadowColor={colors.accent.dark}
        value={networkName}
        label="Sieć"
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
  shadowColor?: string;
}

function StatItem({
  icon,
  iconBg,
  value,
  label,
  valueColor,
  index,
  shadowColor,
}: StatItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100 + 50).springify()}
      style={styles.statWrapper}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: iconBg, shadowColor: shadowColor },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[styles.valueText, valueColor && { color: valueColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
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
    alignItems: "flex-start",
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
    ...shadows.light,
  },
  valueText: {
    fontSize: 16,
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
