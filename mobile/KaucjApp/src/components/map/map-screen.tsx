import React, { useRef, useEffect, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";

import { Offer, DepositMachine } from "@/src/types";
import { OfferMarker } from "./markers/offer-marker";
import { MachineMarker } from "./markers/machine-marker";
import { useUserLocation } from "./use-user-location";
import { SelectedMapItem } from "./map-container";
import { useDebounce } from "./use-debounce";
import { useAccumulatedMapData } from "./use-accumulate-map";
import MapFetchIndicator from "./map-fetch-indicator";

import { useSearchOffers } from "@/src/api/hooks/use-offer";
import { useSearchMachines } from "@/src/api/hooks/use-machines";

import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { getSnappedBBox } from "@/src/lib";

interface MapScreenProps {
  selectedItem: SelectedMapItem | null;
  onOfferPress: (offer: Offer) => void;
  onMachinePress: (machine: DepositMachine) => void;
}

export default function MapScreen({
  selectedItem,
  onOfferPress,
  onMachinePress,
}: MapScreenProps) {
  const { initialRegion, isLocationLoading } = useUserLocation();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (initialRegion && !region) {
      setRegion(initialRegion);
    }
  }, [initialRegion]);

  const debouncedRegion = useDebounce(region, 600);

  const searchBBox = useMemo(
    () => (debouncedRegion ? getSnappedBBox(debouncedRegion) : null),
    [debouncedRegion],
  );

  const isSearchEnabled = !!searchBBox;

  const {
    data: latestOffers,
    isLoading: isOffersLoading,
    isError: isOffersError,
    isFetching: isOffersFetching,
    error: offersError,
    refetch: refetchOffers,
  } = useSearchOffers(searchBBox!, isSearchEnabled);

  const {
    data: latestMachines,
    isLoading: isMachinesLoading,
    isError: isMachinesError,
    isFetching: isMachinesFetching,
    error: machinesError,
    refetch: refetchMachines,
  } = useSearchMachines(searchBBox!, isSearchEnabled);

  const offers = useAccumulatedMapData(latestOffers, (o) => o.offer_id);
  const depositMachines = useAccumulatedMapData(latestMachines, (m) => m.id);

  const isFetching =
    isOffersFetching ||
    isMachinesFetching ||
    isOffersLoading ||
    isMachinesLoading;

  // Move the map when an item is selected from the bottom sheet.
  useEffect(() => {
    if (selectedItem && mapRef.current) {
      const LATITUDE_DELTA = 0.01;
      const LONGITUDE_DELTA = 0.01;

      const { latitude, longitude } = selectedItem.data;
      const offsetLatitude = latitude - LATITUDE_DELTA * 0.25;

      mapRef.current.animateToRegion(
        {
          latitude: offsetLatitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        500,
      );
    }
  }, [selectedItem]);

  const handleRegionChangeComplete = (newRegion: Region) => {
    console.log("Region changed to:", newRegion);
    setRegion(newRegion);
  };

  if (isLocationLoading || !initialRegion) {
    return <LoadingState title="Ładowanie lokalizacji..." />;
  }

  if (isOffersError) {
    const errorMessage =
      offersError?.response?.data?.message ||
      offersError?.message ||
      "An unexpected error occurred while loading offers.";

    return (
      <ErrorState
        title="Oops! Coś poszło nie tak podczas ładowania ofert."
        message={errorMessage}
        onRetry={refetchOffers}
      />
    );
  }

  if (isMachinesError) {
    const errorMessage =
      machinesError?.response?.data?.message ||
      machinesError?.message ||
      "An unexpected error occurred while loading kaucjomatów.";

    return (
      <ErrorState
        title="Oops! Coś poszło nie tak podczas ładowania kaucjomatów."
        message={errorMessage}
        onRetry={refetchMachines}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
        moveOnMarkerPress={false}
      >
        {offers.map((offer) => (
          <OfferMarker
            key={`offer-${offer.offer_id}`}
            offer={offer}
            onPress={onOfferPress}
          />
        ))}

        {depositMachines.map((machine) => (
          <MachineMarker
            key={`machine-${machine.id}`}
            machine={machine}
            onPress={onMachinePress}
          />
        ))}
      </MapView>

      <MapFetchIndicator isFetching={isFetching} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
