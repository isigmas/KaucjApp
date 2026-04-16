import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";

import { Offer, DepositMachine } from "@/src/types";
import { OfferMarker } from "./markers/offer-marker";
import { MachineMarker } from "./markers/machine-marker";
import { useUserLocation } from "./use-user-location";
import { SelectedMapItem } from "./map-container";
import { useAllOffers } from "@/src/api/hooks/use-offer";

import { useAllMachines } from "@/src/api/hooks/use-machines";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";

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
  const {
    data: offers,
    isLoading: isOffersLoading,
    isError: isOffersError,
    error: OfrersError,
    refetch: refetchOffers,
    isRefetching: isRefetchingOffers,
  } = useAllOffers();

  const {
    data: depositMachines,
    isLoading: isMachinesLoading,
    isError: isMachinesError,
    error: machinesError,
    refetch: refetchMachines,
    isRefetching: isMachinesRefetching,
  } = useAllMachines();

  const { initialRegion, isLocationLoading } = useUserLocation();

  const isPending =
    isLocationLoading ||
    isOffersLoading ||
    isRefetchingOffers ||
    isMachinesLoading ||
    isMachinesRefetching;

  const mapRef = useRef<MapView>(null);

  // move the map when any item is selected to place it above  the bottom sheet
  useEffect(() => {
    if (selectedItem && mapRef.current) {
      const LATITUDE_DELTA = 0.01;
      const LONGITUDE_DELTA = 0.01;

      // Extract coordinates from either Offer or DepositMachine
      const { latitude, longitude } = selectedItem.data;
      const offsetLatitude = latitude - LATITUDE_DELTA * 0.25;

      mapRef.current.animateToRegion(
        {
          latitude: offsetLatitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        500,
      );
    }
  }, [selectedItem]);

  if (isPending) {
    const loadingTitle = isLocationLoading
      ? "Ładowanie lokalizacji..."
      : "Ładowanie danych...";

    return <LoadingState title={loadingTitle} />;
  }
  if (isOffersError) {
    const errorMessage =
      OfrersError?.response?.data?.message ||
      OfrersError?.message ||
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
      "An unexpected error occurred while loading machines.";

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
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          moveOnMarkerPress={false}
        >
          {offers?.map((offer) => (
            <OfferMarker
              key={`offer-${offer.offer_id}`}
              offer={offer}
              onPress={onOfferPress}
            />
          ))}

          {depositMachines?.map((machine) => (
            <MachineMarker
              key={`machine-${machine.id}`}
              machine={machine}
              onPress={onMachinePress}
            />
          ))}
        </MapView>
      )}
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
