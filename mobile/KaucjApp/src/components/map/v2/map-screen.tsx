import React, { useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView from "react-native-maps";

import { useMyOffers } from "@/src/api/hooks/use-offer";
import { Offer } from "@/src/types";
import { OfferMarker } from "./offer-marker";
import { useUserLocation } from "./use-user-location";

interface MapScreenProps {
  onMarkerPress: (offer: Offer) => void;
}

export default function MapScreen({ onMarkerPress }: MapScreenProps) {
  const { data: offers, isLoading: isOffersLoading, isError } = useMyOffers();
  const { initialRegion, isLocationLoading } = useUserLocation();
  const mapRef = useRef<MapView>(null);

  if (isLocationLoading || isOffersLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          {isLocationLoading
            ? "Ładowanie lokalizacji..."
            : "Ładowanie ofert..."}
        </Text>
      </View>
    );
  }

  if (isError || !offers) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Failed to load offers onto the map.
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
          {offers.map((offer) => (
            <OfferMarker
              key={`offer-${offer.offer_id}`}
              offer={offer}
              onPress={onMarkerPress}
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
