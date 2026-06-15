import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Region } from "react-native-maps";

import { DepositMachine, Offer, SelectedMapItem } from "@/src/types";
import { OfferMarker } from "./markers/offer-marker";
import { MachineMarker } from "./markers/machine-marker";
import MapFetchIndicator from "../ui/map-fetch-indicator";

interface MapViewProps {
  initialRegion: Region;
  offers: Offer[];
  machines: DepositMachine[];
  isFetching: boolean;
  selectedItem: SelectedMapItem | null;
  onRegionChange: (region: Region) => void;
  onOfferPress: (offer: Offer) => void;
  onMachinePress: (machine: DepositMachine) => void;
}

// this is the zoom level when an item is selected.
const SELECTION_LATITUDE_DELTA = 0.003;
const SELECTION_LONGITUDE_DELTA = 0.003;
const SELECTION_ANIMATION_MS = 500;

function MapSurface({
  initialRegion,
  offers,
  machines,
  isFetching,
  selectedItem,
  onRegionChange,
  onOfferPress,
  onMachinePress,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!selectedItem || !mapRef.current) return;

    const { latitude, longitude } = selectedItem;
    mapRef.current.animateToRegion(
      {
        latitude: latitude - SELECTION_LATITUDE_DELTA * 0.25, // this is the offset to avoid the sheet covering the marker.
        longitude,
        latitudeDelta: SELECTION_LATITUDE_DELTA,
        longitudeDelta: SELECTION_LONGITUDE_DELTA,
      },
      SELECTION_ANIMATION_MS,
    );
  }, [selectedItem]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation
        showsMyLocationButton
        moveOnMarkerPress={false}
        minZoomLevel={9}
      >
        {offers.map((offer) => (
          <OfferMarker
            key={`offer-${offer.offerId}`}
            offer={offer}
            onPress={onOfferPress}
          />
        ))}

        {machines.map((machine) => (
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

export default React.memo(MapSurface);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
