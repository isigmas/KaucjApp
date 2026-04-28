import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { DepositMachine, DepositMachineStatus, OpeningHour } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";
import { formatHour, getDayName, getMachineStatusConfig } from "@/src/lib";
import CurrentOpeningStatus from "./current-opening-status";
import {
  useMachineDetails,
  useUpdateMachineStatus,
} from "@/src/api/hooks/use-machines";
import LoadingState from "../../states/loading-state";
import ErrorState from "../../states/error-state";
import EmptyState from "../../states/empty-state";

export default function MachineDetails({ machineId }: { machineId: number }) {
  const {
    data: machine,
    isLoading,
    isError,
    error,
    refetch,
  } = useMachineDetails(machineId);
  const { mutate: updateStatus, isPending } = useUpdateMachineStatus();

  if (isLoading) {
    return <LoadingState title="Ładowanie szczegółów kaucjomatu" />;
  }

  if (isError) {
    const message =
      error.message || "Nie udało się pobrać szczegółów kaucjomatu.";
    return (
      <ErrorState
        title="Ops! coś poszło nie tak podczas szukania tego kaucjomatu."
        message={message}
        onRetry={refetch}
      />
    );
  }

  if (!machine) {
    return (
      <EmptyState title="Brak informacji o kaucjomacie." onRefresh={refetch} />
    );
  }

  const { color: statusColor, label: statusLabel } = getMachineStatusConfig(
    machine.status,
  );
  const isUnavailable = machine.status !== "AVAILABLE";

  const handleStatusChange = (newStatus: DepositMachineStatus) => {
    if (machine.status !== newStatus) {
      updateStatus({ id: machine.id, status: newStatus });
    }
  };

  return (
    <View style={styles.container}>
      <MachineHeader
        networkName={machine.networkName}
        statusLabel={statusLabel}
        statusColor={statusColor}
        currentStatus={machine.status}
        isPending={isPending}
        onStatusChange={handleStatusChange}
      />

      {isUnavailable && (
        <UnavailableWarning status={machine.status} statusColor={statusColor} />
      )}

      <InfoCard address={machine.address} openingHours={machine.openingHours} />

      <OpeningHoursCard openingHours={machine.openingHours} />

      <MachineImage />
    </View>
  );
}

function MachineHeader({
  networkName,
  statusLabel,
  statusColor,
  currentStatus,
  isPending,
  onStatusChange,
}: {
  networkName: string;
  statusLabel: string;
  statusColor: string;
  currentStatus: DepositMachineStatus;
  isPending: boolean;
  onStatusChange: (status: DepositMachineStatus) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (status: DepositMachineStatus) => {
    onStatusChange(status);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Kaucjomat</Text>
        <Text style={styles.subtitle}>Sieć handlowa: {networkName}</Text>
      </View>

      <View style={{ position: "relative", zIndex: 10 }}>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor, opacity: isPending ? 0.7 : 1 },
          ]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPending}
        >
          <Text style={styles.statusText}>
            {isPending ? "Zgłaszanie..." : `${statusLabel}  ▼`}
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownContainer}>
            {currentStatus !== "AVAILABLE" ? (
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={() => handleSelect("AVAILABLE")}
              >
                <Text style={styles.dropdownText}>
                  Zgłoś poprawne działanie
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelect("FULL")}
                >
                  <Text style={styles.dropdownText}>Zgłoś przepełnienie</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                  onPress={() => handleSelect("OUT_OF_ORDER")}
                >
                  <Text style={styles.dropdownText}>Zgłoś awarię</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
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
          {day.isClosed ? (
            <Text
              style={[styles.primaryText, { color: colors.text.secondary }]}
            >
              zamknięte
            </Text>
          ) : (
            <Text style={styles.primaryText}>
              {formatHour(day.openTime)} - {formatHour(day.closeTime)}
            </Text>
          )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xxl,
  },

  //dROPDOWN

  dropdownContainer: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 0,
    backgroundColor: "#ffffff",
    borderRadius: rounded.apple,
    paddingVertical: spacing.xs,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
});
