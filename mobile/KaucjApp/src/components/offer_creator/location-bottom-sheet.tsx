import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { colors, rounded } from "@/src/theme";

const KRAKOW_FALLBACK = {
  latitude: 50.0647,
  longitude: 19.945,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export interface PickedLocation {
  latitude: number;
  longitude: number;
}

export interface LocationBottomSheetRef {
  open: (initial?: PickedLocation | null) => void;
  close: () => void;
}

interface LocationBottomSheetProps {
  onConfirm: (location: PickedLocation) => void;
}

export const LocationBottomSheet = forwardRef<
  LocationBottomSheetRef,
  LocationBottomSheetProps
>(function LocationBottomSheet({ onConfirm }, ref) {
  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const snapPoints = useMemo(() => ["80%"], []);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PickedLocation>({
    latitude: KRAKOW_FALLBACK.latitude,
    longitude: KRAKOW_FALLBACK.longitude,
  });

  useImperativeHandle(
    ref,
    () => ({
      open: (initial) => {
        if (initial) {
          setSelected(initial);
        }
        sheetRef.current?.expand();
      },
      close: () => sheetRef.current?.close(),
    }),
    [],
  );

  // When the sheet opens, animate the map to the chosen pin or, if no pin
  // has been set yet, to the user's current location (best effort only).
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const animateTo = (coords: PickedLocation, durationMs = 600) => {
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        durationMs,
      );
    };

    animateTo(selected, 0);

    const isFallbackOnly =
      selected.latitude === KRAKOW_FALLBACK.latitude &&
      selected.longitude === KRAKOW_FALLBACK.longitude;

    if (!isFallbackOnly) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setSelected(coords);
        animateTo(coords, 1000);
      } catch (error) {
        console.warn("Could not fetch user location for picker", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, selected]);

  const handleConfirm = useCallback(() => {
    onConfirm(selected);
    sheetRef.current?.close();
  }, [onConfirm, selected]);

  const handleSheetChange = useCallback((index: number) => {
    setIsOpen(index >= 0);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableContentPanningGesture={false}
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.sheetHandle}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wybierz lokalizację</Text>
          <Pressable onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Potwierdź</Text>
          </Pressable>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={KRAKOW_FALLBACK}
          showsUserLocation
          showsMyLocationButton
          onPress={(event) => setSelected(event.nativeEvent.coordinate)}
        >
          <Marker coordinate={selected} pinColor={colors.primary.base} />
        </MapView>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
  },
  sheetHandle: {
    backgroundColor: colors.status.border,
  },
  sheetContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 32,
    backgroundColor: colors.primary.base,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
  },
  map: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
});
