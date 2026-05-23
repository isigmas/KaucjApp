import React from "react";
import { View, StyleSheet } from "react-native";

import { Store, MapPin, Power } from "lucide-react-native";
import { colors, spacing } from "@/src/theme";
import { getMachineStatusConfig } from "@/src/lib";
import { DepositMachineStatus } from "@/src/types";
import StatItem from "@/src/components/ui/stat-item";

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

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: spacing.lg,
    width: "100%",
  },
});
