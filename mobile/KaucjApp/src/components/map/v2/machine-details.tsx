import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { DepositMachine } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";
import { formatHour, getDayName, getMachineStatusConfig } from "@/src/lib";

interface MachineDetailsProps {
  machine: DepositMachine;
}

export default function MachineDetails({ machine }: MachineDetailsProps) {
  const { color: statusColor, label: statusLabel } = getMachineStatusConfig(
    machine.status,
  );

  const todaysOpeningHours = useMemo(() => {
    let dayOfWeek = new Date().getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    return machine.openingHours.find((days) => days.dayOfWeek === dayOfWeek);
  }, [machine.id]);

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
        {todaysOpeningHours && (
          <>
            //Display a component that actually checks the current day and time
            and displays the relevant information eg. [GREEN COLOR] OPEN until 20:00 or
            [RED COLOR] CLOSED until 08:00
          </>
        )}
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
  secondaryText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
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
  // New style added for the image
  machineImage: {
    width: "100%",
    height: 200,
    borderRadius: rounded.xl,
    marginTop: spacing.lg,
  },
});
