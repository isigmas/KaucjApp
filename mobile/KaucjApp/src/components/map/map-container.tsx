import React from "react";
import { StyleSheet, View } from "react-native";

import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";

import MapSurface from "./map-view";
import DetailsSheet from "./details-sheet";
import { useMapController } from "./hooks/use-map-controller";

// MAIN MAP CONTAINER - MAP PARENT
export default function MapContainer() {
  const {
    initialRegion,
    isLocationLoading,
    onRegionChange,
    offers,
    machines,
    isFetching,
    offersError,
    machinesError,
    selection,
  } = useMapController();

  if (isLocationLoading || !initialRegion) {
    return <LoadingState title="Ładowanie lokalizacji..." />;
  }

  if (offersError.isError) {
    return (
      <ErrorState
        title="Oops! Coś poszło nie tak podczas ładowania ofert."
        message={
          offersError.error?.message ||
          "An unexpected error occurred while loading offers."
        }
        onRetry={offersError.refetch}
      />
    );
  }

  if (machinesError.isError) {
    return (
      <ErrorState
        title="Oops! Coś poszło nie tak podczas ładowania kaucjomatów."
        message={
          machinesError.error?.message ||
          "An unexpected error occurred while loading kaucjomatów."
        }
        onRetry={machinesError.refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapSurface
        initialRegion={initialRegion}
        offers={offers}
        machines={machines}
        isFetching={isFetching}
        selectedItem={selection.selectedItem}
        onRegionChange={onRegionChange}
        onOfferPress={selection.selectOffer}
        onMachinePress={selection.selectMachine}
      />

      <DetailsSheet
        ref={selection.bottomSheetRef}
        selectedItem={selection.selectedItem}
        onChange={selection.handleSheetChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
});
