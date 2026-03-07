import React, { useRef, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";

import { useLocation } from "@/src/hooks/useLocation";
import { useClusters, isCluster } from "@/src/hooks/useClusters";
import { MOCK_ADS, DEFAULT_REGION } from "@/src/lib/mockData";
import { colors } from "@/src/theme";
import { MapHeader } from "@/src/components/map/MapHeader";
import { SearchBarOverlay } from "@/src/components/map/SearchBarOverlay";
import { BottlePin } from "@/src/components/map/BottlePin";
import { ClusterPin } from "@/src/components/map/ClusterPin";

/**
 * Wrapper that starts with tracksViewChanges=true so the native Google Maps
 * renderer waits for the custom React view to fully lay out before snapshotting
 * it into a native bitmap, then locks to false to prevent re-snapshotting on
 * every re-render (which causes the disappearing-marker flicker).
 */
function StableMarker({
  children,
  ...markerProps
}: React.ComponentProps<typeof Marker>) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  return (
    <Marker
      {...markerProps}
      tracksViewChanges={tracksViewChanges}
      onLayout={() => setTracksViewChanges(false)}
    >
      {children}
    </Marker>
  );
}

export default function HomeScreen() {
  const { coords, loading, errorMsg } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const clusters = useClusters(MOCK_ADS, region);

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    }
  }, [coords]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.base} />
        <Text style={styles.infoText}>Ładowanie lokalizacji…</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        onRegionChangeComplete={setRegion}
      >
        {clusters.map((item) => {
          const [longitude, latitude] = item.geometry.coordinates;
          const coordinate = { latitude, longitude };

          if (isCluster(item)) {
            return (
              <StableMarker
                key={`cluster-${item.id}`}
                coordinate={coordinate}
              >
                <ClusterPin
                  totalBottles={item.properties.totalBottles}
                  adCount={item.properties.point_count}
                />
              </StableMarker>
            );
          }

          const offer = item.properties;
          const totalQty = offer.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <StableMarker
              key={`pin-${offer.offer_id}`}
              coordinate={coordinate}
              title={offer.address}
              description={`${offer.user.username} · ${totalQty} szt.`}
            >
              <BottlePin count={totalQty} />
            </StableMarker>
          );
        })}
      </MapView>

      <MapHeader balancePLN={42.5} />
      <SearchBarOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background.main,
  },
  infoText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 15,
    color: colors.status.error,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});