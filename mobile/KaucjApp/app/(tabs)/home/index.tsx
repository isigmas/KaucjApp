import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocateFixed, Compass } from "lucide-react-native";

import { useLocation } from "@/src/hooks/useLocation";
import { useClusters, isCluster } from "@/src/hooks/useClusters";
import { DEFAULT_REGION, type Offer } from "@/src/lib/mockData";
import { fetchOffers } from "@/src/lib/api";
import { colors } from "@/src/theme";
import { MapHeader } from "@/src/components/map/MapHeader";
import { BottlePin } from "@/src/components/map/BottlePin";
import { ClusterPin } from "@/src/components/map/ClusterPin";
import { OfferSheet } from "@/src/components/map/OfferSheet";
import {
  CategoryFilters,
  type QuantityFilter,
} from "@/src/components/map/CategoryFilters";

// ── Constants ─────────────────────────────────────────────────────────────────
const GLASS_BOTTLE_IDS = new Set([1]);

/**
 * Prevents flickering of custom markers on Google Maps by locking 
 * bitmap generation after the initial layout.
 */
function StableMarker({
  children,
  ...markerProps
}: React.ComponentProps<typeof Marker>) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const handleLayout = useCallback(() => {
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

const offerTotalQty = (offer: Offer) => 
  offer.items.reduce((sum, i) => sum + i.quantity, 0);

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { coords, loading: locationLoading, errorMsg } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  // ── Offers from API ─────────────────────────────────────────────────────────
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setOffersLoading(true);
    setOffersError(null);

    fetchOffers()
      .then((data) => {
        if (!cancelled) setOffers(data);
      })
      .catch((err) => {
        if (!cancelled) setOffersError(err.message ?? "Nie udało się pobrać ofert.");
      })
      .finally(() => {
        if (!cancelled) setOffersLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Selected offer for bottom sheet
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Filter state
  const [activeQuantity, setActiveQuantity] = useState<QuantityFilter>(null);
  const [activeAttributes, setActiveAttributes] = useState<string[]>([]);

  // Unique key for markers to force remount on filter change
  const filterKey = useMemo(
    () => `${activeQuantity ?? "x"}_${activeAttributes.join(",")}`,
    [activeQuantity, activeAttributes],
  );

  const centerOnUser = useCallback(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, 600);
    }
  }, [coords]);

  // Funkcja resetująca obrót mapy do północy
  const resetNorth = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera({ heading: 0, pitch: 0 });
    }
  }, []);

  const filteredAds = useMemo(() => {
    const noGlass = activeAttributes.includes("no_glass");
    const onlyFree = activeAttributes.includes("free");

    return offers.filter((offer) => {
      if (activeQuantity !== null && offerTotalQty(offer) < activeQuantity) return false;
      if (noGlass && offer.items.some((i) => GLASS_BOTTLE_IDS.has(i.bottle_id))) return false;
      if (onlyFree && !offer.items.every((i) => i.fee === 0)) return false;
      return true;
    });
  }, [activeQuantity, activeAttributes, offers]);

  const clusters = useClusters(filteredAds, region);

  useEffect(() => {
    if (coords) centerOnUser();
  }, [coords, centerOnUser]);

  if (locationLoading) {
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

  if (offersError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{offersError}</Text>
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
        onPress={() => setSelectedOffer(null)}
      >
        {clusters.map((item) => {
          const [lng, lat] = item.geometry.coordinates;
          const coordinate = { latitude: lat, longitude: lng };

          if (isCluster(item)) {
            return (
              <StableMarker key={`${filterKey}-c${item.id}`} coordinate={coordinate}>
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
              onPress={() => setSelectedOffer(offer)}
            >
              <BottlePin count={qty} />
            </StableMarker>
          );
        })}
      </MapView>

      <MapHeader balancePLN={42.5} />

      {offersLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary.base} />
          <Text style={styles.loadingOverlayText}>Ładowanie ofert…</Text>
        </View>
      )}

      <CategoryFilters
        activeQuantity={activeQuantity}
        onQuantityChange={setActiveQuantity}
        activeAttributes={activeAttributes}
        onAttributesChange={setActiveAttributes}
      />

      {/* PRZYCISK KOMPASU (Reset północy) */}
      <TouchableOpacity 
        style={[styles.mapButton, { bottom: insets.bottom + 126 }]} 
        onPress={resetNorth}
        activeOpacity={0.8}
      >
        <Compass size={24} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* PRZYCISK LOKALIZACJI */}
      <TouchableOpacity 
        style={[styles.mapButton, { bottom: insets.bottom + 60 }]} 
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <LocateFixed size={24} color={colors.primary.base} />
      </TouchableOpacity>

      {selectedOffer && (
        <OfferSheet
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onReserve={() => {
            // TODO: call reservation endpoint
            setSelectedOffer(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background.main,
  },
  infoText: { fontSize: 15, color: colors.text.secondary },
  errorText: {
    fontSize: 15,
    color: colors.status.error,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loadingOverlayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  mapButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: colors.background.main,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  }
});