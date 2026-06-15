import React from "react";
import { StyleSheet, View } from "react-native";

import MapLoadingState from "@/src/components/map/overlay/map-loading-state";
import MapErrorOverlay from "@/src/components/map/overlay/map-error-overlay";

import MapSurface from "./map-view";
import DetailsSheet from "./details-sheet";
import { useMapController } from "./hooks/use-map-controller";

// MAIN MAP CONTAINER - MAP PARENT
export default function MapContainer() {
  const {
    filter,
    setFilter,
    initialRegion,
    isLocationLoading,
    onRegionChange,
    offers,
    machines,
    isFetching,
    errors,
    selection,
  } = useMapController();

  if (isLocationLoading || !initialRegion) {
    return <MapLoadingState />;
  }

  return (
    <View style={styles.container}>
      <MapSurface
        initialRegion={initialRegion}
        offers={offers}
        machines={machines}
        isFetching={isFetching}
        selectedItem={selection.selectedItem}
        filter={filter}
        onFilterChange={setFilter}
        onRegionChange={onRegionChange}
        onOfferPress={selection.selectOffer}
        onMachinePress={selection.selectMachine}
      />

      <MapErrorOverlay errors={errors} />

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
