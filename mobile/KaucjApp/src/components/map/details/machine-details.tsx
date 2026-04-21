import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { DepositMachine, OpeningHour } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";
import { formatHour, getDayName, getMachineStatusConfig } from "@/src/lib";
import CurrentOpeningStatus from "./current-opening-status";

export default function MachineDetails({
  machine,
}: {
  machine: DepositMachine;
}) {
  const { color: statusColor, label: statusLabel } = getMachineStatusConfig(
    machine.status,
  );
  const isUnavailable = machine.status !== "AVAILABLE";

  return (
    <View style={styles.container}>
      <MachineHeader
        networkName={machine.networkName}
        statusLabel={statusLabel}
        statusColor={statusColor}
      />

      <InfoCard address={machine.address} openingHours={machine.openingHours} />

      <OpeningHoursCard openingHours={machine.openingHours} />

      {isUnavailable && (
        <UnavailableWarning status={machine.status} statusColor={statusColor} />
      )}

      <MachineImage />
    </View>
  );
}

function MachineHeader({
  networkName,
  statusLabel,
  statusColor,
}: {
  networkName: string;
  statusLabel: string;
  statusColor: string;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Kaucjomat</Text>
        <Text style={styles.subtitle}>Sieć handlowa: {networkName}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

function InfoCard({
  address,
  openingHours,
}: {
  address: string;
  openingHours: OpeningHour[];
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Lokalizacja</Text>
      <Text style={styles.primaryText}>{address}</Text>
      <CurrentOpeningStatus openingHours={openingHours} />
    </View>
  );
}

function OpeningHoursCard({ openingHours }: { openingHours: OpeningHour[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Godziny otwarcia</Text>
      {openingHours.map((day) => (
        <View style={styles.hoursRow} key={day.dayOfWeek}>
          <Text style={styles.primaryText}>{getDayName(day.dayOfWeek)}</Text>
          <Text style={styles.primaryText}>
            {formatHour(day.openTime)} - {formatHour(day.closeTime)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function UnavailableWarning({
  status,
  statusColor,
}: {
  status: string;
  statusColor: string;
}) {
  const message =
    status === "FULL"
      ? "Ten kaucjomat jest obecnie pełny. Proszę wybrać inny punkt w okolicy."
      : "Ten kaucjomat uległ awarii. Przepraszamy za utrudnienia.";

  return (
    <View style={[styles.warningCard, { borderLeftColor: statusColor }]}>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
}

function MachineImage() {
  return (
    <Image
      source={require("@/assets/images/kaucjomat.jpg")}
      style={styles.machineImage}
      resizeMode="cover"
    />
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

  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
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
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
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
