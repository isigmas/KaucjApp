import React from "react";
import { View, StyleSheet } from "react-native";
import { DepositMachineStatus } from "@/src/types";
import { getMachineStatusConfig } from "@/src/lib";
import {
  useMachineDetails,
  useUpdateMachineStatus,
} from "@/src/api/hooks/use-machines";
import LoadingState from "@/src/components/states/loading-state";
import ErrorState from "@/src/components/states/error-state";
import EmptyState from "@/src/components/states/empty-state";
import DetailHeader from "../details-header";
import WarningBanner from "../warning-banner";
import StatusDropdown from "./status-dropdown";
import LocationCard from "./location-card";
import OpeningHoursCard from "./opening-hours-card";
import MachineImage from "./machine-image";
import { spacing } from "@/src/theme";

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
  const warningMessage =
    machine.status === "FULL"
      ? "Ten kaucjomat jest obecnie pełny. Proszę wybrać inny punkt w okolicy."
      : "Ten kaucjomat uległ awarii. Przepraszamy za utrudnienia.";

  const handleStatusChange = (newStatus: DepositMachineStatus) => {
    if (machine.status !== newStatus) {
      updateStatus({ id: machine.id, status: newStatus });
    }
  };

  return (
    <View style={styles.container}>
      <DetailHeader
        title="Kaucjomat"
        subtitle={`Sieć handlowa: ${machine.networkName}`}
        rightSlot={
          <StatusDropdown
            statusLabel={statusLabel}
            statusColor={statusColor}
            currentStatus={machine.status}
            isPending={isPending}
            onStatusChange={handleStatusChange}
          />
        }
      />

      {isUnavailable && (
        <WarningBanner accentColor={statusColor} message={warningMessage} />
      )}

      <LocationCard
        address={machine.address}
        openingHours={machine.openingHours}
      />

      <OpeningHoursCard openingHours={machine.openingHours} />

      <MachineImage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
});
