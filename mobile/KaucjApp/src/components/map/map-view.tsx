import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import Constants from "expo-constants";

import { DepositMachine, MapFilter, Offer, SelectedMapItem } from "@/src/types";
import { OfferMarker } from "./markers/offer-marker";
import { MachineMarker } from "./markers/machine-marker";
import MapFetchIndicator from "./overlay/map-fetch-indicator";
import MapFilterControl from "./overlay/map-filter";

interface MapViewProps {
  initialRegion: Region;
  offers: Offer[];
  machines: DepositMachine[];
  isFetching: boolean;
  selectedItem: SelectedMapItem | null;
  filter: MapFilter;
  onFilterChange: (filter: MapFilter) => void;
  onRegionChange: (region: Region) => void;
  onOfferPress: (offer: Offer) => void;
  onMachinePress: (machine: DepositMachine) => void;
}

const FILTER_TOP_OFFSET = (Constants.statusBarHeight ?? 0) + 8;

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
  filter,
  onFilterChange,
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
        minZoomLevel={11}
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

      <View style={styles.filterZone} pointerEvents="box-none">
        <MapFilterControl value={filter} onChange={onFilterChange} />
      </View>

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
  filterZone: {
    position: "absolute",
    top: FILTER_TOP_OFFSET,
    left: 16,
    right: 16,
  },
});
