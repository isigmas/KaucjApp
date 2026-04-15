import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { DepositMachine, OpeningHour } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";
import { formatHour, getDayName, getMachineStatusConfig } from "@/src/lib";

interface MachineDetailsProps {
  machine: DepositMachine;
}

export default function MachineDetails({ machine }: MachineDetailsProps) {
  const { color: statusColor, label: statusLabel } = getMachineStatusConfig(
    machine.status,
  );

  return (
    <View style={styles.container}>
      {/* Header: Title & Status */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Kaucjomat</Text>
          <Text style={styles.subtitle}>
            Sieć handlowa: {machine.networkName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={[styles.statusText]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Location Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lokalizacja</Text>
        <Text style={styles.primaryText}>{machine.address}</Text>
        <CurrentOpeningStatus openingHours={machine.openingHours} />
      </View>

      {/* Hours Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Godziny otwarcia</Text>
        {machine.openingHours.map((day) => (
          <View key={day.dayOfWeek} style={styles.hoursRow}>
            <Text style={styles.primaryText}>{getDayName(day.dayOfWeek)}</Text>
            <Text style={styles.primaryText}>
              {formatHour(day.openTime)} - {formatHour(day.closeTime)}
            </Text>
          </View>
        ))}
      </View>

      {machine.status !== "AVAILABLE" && (
        <View style={[styles.warningCard, { borderLeftColor: statusColor }]}>
          <Text style={styles.warningText}>
            {machine.status === "FULL"
              ? "Ten kaucjomat jest obecnie pełny. Proszę wybrać inny punkt w okolicy."
              : "Ten kaucjomat uległ awarii. Przepraszamy za utrudnienia."}
          </Text>
        </View>
      )}

      <Image
        source={require("@/assets/images/kaucjomat.jpg")}
        style={styles.machineImage}
        resizeMode="cover"
      />
    </View>
  );
}

const CurrentOpeningStatus = ({
  openingHours,
}: {
  openingHours: OpeningHour[];
}) => {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      if (!openingHours || openingHours.length === 0) return;

      const now = new Date();
      let currentDayOfWeek = now.getDay();
      currentDayOfWeek = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const today = openingHours.find((h) => h.dayOfWeek === currentDayOfWeek);

      // seee if it's currently open
      if (
        today &&
        currentTime >= today.openTime &&
        currentTime < today.closeTime
      ) {
        setStatus({
          isOpen: true,
          text: `Otwarte do ${formatHour(today.closeTime)}`,
        });
        return;
      }

      // If closed, find the next available opening time
      let nextOpenTime = "";
      let nextDayOfWeek = "";
      if (today && currentTime < today.openTime) {
        nextOpenTime = today.openTime;
        nextDayOfWeek = getDayName(today.dayOfWeek);
      } else {
        for (let i = 1; i <= 7; i++) {
          const nextDay = ((currentDayOfWeek + i - 1) % 7) + 1;
          const nextDayData = openingHours.find((h) => h.dayOfWeek === nextDay);
          if (nextDayData) {
            nextOpenTime = nextDayData.openTime;
            nextDayOfWeek = getDayName(nextDayData.dayOfWeek);
            break;
          }
        }
      }

      setStatus({
        isOpen: false,
        text: nextOpenTime
          ? `Zamknięte do ${formatHour(nextOpenTime)} (${nextDayOfWeek})`
          : "Obecnie zamknięte",
      });
    };

    checkStatus();
    // Update the status every minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [openingHours]);

  if (!status) return null;

  return (
    <Text
      style={[
        styles.dynamicStatusText,
        {
          color: status.isOpen ? colors.status.success : colors.status.error,
        },
      ]}
    >
      {status.text}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rounded.pill,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  separator: {
    height: 1,
    backgroundColor: colors.status.border,
    marginVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  primaryText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  dynamicStatusText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  openIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status?.success || "#10b981",
  },
  warningCard: {
    backgroundColor: colors.background.main,
    padding: spacing.md,
    borderRadius: rounded.xl,
    borderLeftWidth: 4,
    marginTop: spacing.xs,
  },
  warningText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  machineImage: {
    width: "100%",
    height: 200,
    borderRadius: rounded.xl,
    marginTop: spacing.lg,
  },
});
