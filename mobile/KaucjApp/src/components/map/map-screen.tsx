import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import MapView from "react-native-maps";

import { Offer, DepositMachine } from "@/src/types";
import { OfferMarker } from "./markers/offer-marker";
import { MachineMarker } from "./markers/machine-marker";
import { useUserLocation } from "./use-user-location";
import { SelectedMapItem } from "./map-container";
import { useAllOffers } from "@/src/api/hooks/use-offer";
import { colors } from "@/src/theme";
import { useAllMachines } from "@/src/api/hooks/use-machines";

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

  if (
    isLocationLoading ||
    isOffersLoading ||
    isRefetchingOffers ||
    isMachinesLoading ||
    isMachinesRefetching
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          {isLocationLoading
            ? "Ładowanie lokalizacji..."
            : "Ładowanie danych..."}
        </Text>
      </View>
    );
  }
  if (isOffersError) {
    const errorMessage =
      OfrersError?.response?.data?.message ||
      OfrersError?.message ||
      "An unexpected error occurred while loading offers.";

    return <MapErrorView message={errorMessage} onRetry={refetchOffers} />;
  }
  if (isMachinesError) {
    const errorMessage =
      machinesError?.response?.data?.message ||
      machinesError?.message ||
      "An unexpected error occurred while loading machines.";

    return <MapErrorView message={errorMessage} onRetry={refetchMachines} />;
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
          {/* Render Offers */}
          {offers?.map((offer) => (
            <OfferMarker
              key={`offer-${offer.offer_id}`}
              offer={offer}
              onPress={onOfferPress}
            />
          ))}
          {/* Render Deposit Machines */}
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

function MapErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.errorTitle}>
        Oops! Coś poszło nie tak podczas ładowania ofert.
      </Text>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
      </Pressable>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  // styles for error view
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  errorTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: colors.primary.base,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 32,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
