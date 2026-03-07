import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";

import { useLocation } from "@/src/hooks/useLocation";
import { useClusters, isCluster } from "@/src/hooks/useClusters";
import { MOCK_ADS, DEFAULT_REGION, type Offer } from "@/src/lib/mockData";
import { colors } from "@/src/theme";
import { MapHeader } from "@/src/components/map/MapHeader";
import { BottlePin } from "@/src/components/map/BottlePin";
import { ClusterPin } from "@/src/components/map/ClusterPin";
import {
  CategoryFilters,
  type QuantityFilter,
} from "@/src/components/CategoryFilters";

// ── Constants ─────────────────────────────────────────────────────────────────
const GLASS_BOTTLE_IDS = new Set([1]);
const NEW_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Wrapper that gives Google Maps time to snapshot the custom React view into a
 * native bitmap before we stop re-snapshotting on every render.
 */
function StableMarker({
  children,
  ...markerProps
}: React.ComponentProps<typeof Marker>) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const handleLayout = useCallback(() => {
    // requestAnimationFrame ensures the native bitmap capture completes
    // before we lock tracking off (prevents blank/invisible markers).
    requestAnimationFrame(() => setTracksViewChanges(false));
  }, []);

  return (
    <Marker
      {...markerProps}
      tracksViewChanges={tracksViewChanges}
      onLayout={handleLayout}
    >
      {children}
    </Marker>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function offerTotalQty(offer: Offer): number {
  return offer.items.reduce((sum, i) => sum + i.quantity, 0);
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { coords, loading, errorMsg } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  // Filter state
  const [activeQuantity, setActiveQuantity] = useState<QuantityFilter>(null);
  const [activeAttributes, setActiveAttributes] = useState<string[]>([]);

  // Fingerprint that changes whenever any filter toggles – used as a key prefix
  // so every marker fully remounts and StableMarker restarts its lifecycle.
  const filterKey = useMemo(
    () => `${activeQuantity ?? "x"}_${activeAttributes.join(",")}`,
    [activeQuantity, activeAttributes],
  );

  const filteredAds = useMemo(() => {
    const now = Date.now();
    const noGlass = activeAttributes.includes("no_glass");
    const onlyNew = activeAttributes.includes("new");

    return MOCK_ADS.filter((offer) => {
      if (activeQuantity !== null && offerTotalQty(offer) < activeQuantity) {
        return false;
      }
      if (noGlass && offer.items.some((i) => GLASS_BOTTLE_IDS.has(i.bottle_id))) {
        return false;
      }
      if (onlyNew) {
        const age = now - new Date(offer.created_at).getTime();
        if (age > NEW_THRESHOLD_MS) return false;
      }
      return true;
    });
  }, [activeQuantity, activeAttributes]);

  const clusters = useClusters(filteredAds, region);

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800,
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
          const [lng, lat] = item.geometry.coordinates;
          const coordinate = { latitude: lat, longitude: lng };

          if (isCluster(item)) {
            return (
              <StableMarker
                key={`${filterKey}-c${item.id}`}
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
          const qty = offerTotalQty(offer);
          return (
            <StableMarker
              key={`${filterKey}-p${offer.offer_id}`}
              coordinate={coordinate}
              title={offer.address}
              description={`${offer.user.username} · ${qty} szt.`}
            >
              <BottlePin count={qty} />
            </StableMarker>
          );
        })}
      </MapView>

      <MapHeader balancePLN={42.5} />
      <CategoryFilters
        activeQuantity={activeQuantity}
        onQuantityChange={setActiveQuantity}
        activeAttributes={activeAttributes}
        onAttributesChange={setActiveAttributes}
      />
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