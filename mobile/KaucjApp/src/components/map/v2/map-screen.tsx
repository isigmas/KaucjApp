import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView from "react-native-maps";

import { useMyOffers } from "@/src/api/hooks/use-offer";
import { Offer } from "@/src/types";
import { OfferMarker } from "./offer-marker";
import { MachineMarker } from "./machine-marker"; // We'll create this next
import { useUserLocation } from "./use-user-location";
import { depositMachines, DepositMachine } from "../../../constants";
import { SelectedMapItem } from "./map-container";

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
  const { data: offers, isLoading: isOffersLoading, isError } = useMyOffers();
  const { initialRegion, isLocationLoading } = useUserLocation();
  const mapRef = useRef<MapView>(null);

  // move the map when any item is selected
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

  if (isLocationLoading || isOffersLoading) {
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
          {depositMachines.map((machine) => (
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

// ... keep your existing styles

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
});
