import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { DepositMachine, mockOpeningHours } from "../../../constants";
import { colors, spacing, rounded } from "@/src/theme";

interface MachineDetailsProps {
  machine: DepositMachine;
}

const getStatusConfig = (status: DepositMachine["status"]) => {
  switch (status) {
    case "AVAILABLE":
      return { label: "Dostępny", color: "#2196F3", bgColor: "#E3F2FD" };
    case "FULL":
      return { label: "Przepełniony", color: "#FF9800", bgColor: "#FFF3E0" };
    case "OUT_OF_ORDER":
      return { label: "Awaria", color: "#F44336", bgColor: "#FFEBEE" };
    default:
      return {
        label: "Nieznany",
        color: colors.text.muted,
        bgColor: colors.background.main,
      };
  }
};

export default function MachineDetails({ machine }: MachineDetailsProps) {
  const statusConfig = getStatusConfig(machine.status);

  const todaysHours = useMemo(() => {
    let dayOfWeek = new Date().getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    return mockOpeningHours.find(
      (h) => h.depositMachineId === machine.id && h.dayOfWeek === dayOfWeek,
    );
  }, [machine.id]);

  return (
    <View style={styles.container}>
      {/* Header: Title & Status */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Kaucjomat</Text>
          <Text style={styles.subtitle}>Sieć handlowa: Biedronka</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
      {/* Location Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lokalizacja</Text>
        <Text style={styles.primaryText}>{machine.address}</Text>
      </View>
      {/* Hours Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Godziny otwarcia (Dzisiaj)</Text>
        {todaysHours ? (
          <View style={styles.hoursRow}>
            <Text style={styles.primaryText}>
              {todaysHours.openTime.slice(0, 5)} -{" "}
              {todaysHours.closeTime.slice(0, 5)}
            </Text>
            <View style={styles.openIndicator} />
          </View>
        ) : (
          <Text style={styles.secondaryText}>Zamknięte lub brak danych</Text>
        )}
      </View>

      {machine.status !== "AVAILABLE" && (
        <View
          style={[styles.warningCard, { borderLeftColor: statusConfig.color }]}
        >
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
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
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
