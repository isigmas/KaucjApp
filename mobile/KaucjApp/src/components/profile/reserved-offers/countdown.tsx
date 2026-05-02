import {
  CountdownDisplayInterval,
  getCountdownConfig,
} from "@/src/lib/countdown";
import { rounded, spacing } from "@/src/theme";
import { AlertTriangle, Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCountdown } from "./use-countdown";

interface CountdownProps {
  expiresAt: string; //ISO date string
  variant?: "pill" | "block";
  interval?: CountdownDisplayInterval;
  showBorder?: boolean;
}

export default function Countdown({
  expiresAt,
  variant = "pill",
  interval = "seconds",
  showBorder = true,
}: CountdownProps) {
  const { urgency, label } = useCountdown({ expiresAt, interval });
  const config = getCountdownConfig(urgency);

  if (variant === "block") {
    return (
      <View
        style={[
          styles.block,
          {
            backgroundColor: config.bg,
            borderWidth: showBorder ? 1 : 0,
            borderColor: config.border,
          },
        ]}
      >
        <Text style={[styles.blockHeaderText, { color: config.fg }]}>
          {urgency === "expired" ? "Rezerwacja wygasła" : "Pozostały czas"}
        </Text>

        <View style={styles.blockHeader}>
          {urgency === "critical" || urgency === "expired" ? (
            <AlertTriangle
              size={30}
              absoluteStrokeWidth={true}
              color={config.fg}
            />
          ) : (
            <Clock size={30} absoluteStrokeWidth={true} color={config.fg} />
          )}
          <Text style={[styles.blockValue, { color: config.fg }]}>{label}</Text>
        </View>

        {urgency === "critical" && (
          <Text style={{ color: config.fg }}>
            Za chwilę twoja rezerwacja wygaśnie
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Clock size={12} color={config.fg} />
      <Text style={[styles.pillText, { color: config.fg }]}>
        Pozostały czas: {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.2,
  },
  block: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: rounded.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  blockHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  blockValue: {
    fontSize: 26,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.5,
  },
});
