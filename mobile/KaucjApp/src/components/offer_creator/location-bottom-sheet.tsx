import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { colors, rounded, spacing } from "@/src/theme";

const ZOOM_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };
const INITIAL_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };
const RECENTER_DURATION = 200;

export interface PickedLocation {
  latitude: number;
  longitude: number;
}

interface LocationBottomSheetProps {
  /** The user's confirmed selection (form value). `null` until they tap "Potwierdź". */
  selectedLocation: PickedLocation | null;
  /** Fallback used as the starting pin position before the user confirms. */
  defaultLocation: PickedLocation;
  onConfirm: (location: PickedLocation) => void;
}

/**
 * Full-screen map picker. The pin always reflects the parent's "current
 * location" (selectedLocation ?? defaultLocation). Internally we keep a local
 * `draft` so map taps update the marker without touching the form — the form
 * is only updated when the user taps "Potwierdź".
 *
 * The map uses `initialRegion` (uncontrolled) so user pans/zooms aren't fought
 * by React state. We explicitly recentre via `animateToRegion` on every open,
 * which gives a predictable, jump-free experience.
 */
const LocationBottomSheet = forwardRef<BottomSheet, LocationBottomSheetProps>(
  ({ selectedLocation, defaultLocation, onConfirm }, ref) => {
    const snapPoints = useMemo(() => ["80%"], []);
    const mapRef = useRef<MapView>(null);

    const initialPin = selectedLocation ?? defaultLocation;
    const [draft, setDraft] = useState<PickedLocation>(initialPin);

    // Reset the draft and recentre the map every time the sheet opens, so
    // the user always starts from the confirmed/default location — never from
    // a stale tap left over from a previous session.
    const handleSheetChange = useCallback(
      (index: number) => {
        if (index < 0) return;
        const pin = selectedLocation ?? defaultLocation;
        setDraft(pin);
        mapRef.current?.animateToRegion(
          { ...pin, ...ZOOM_DELTA },
          RECENTER_DURATION,
        );
      },
      [selectedLocation, defaultLocation],
    );

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
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handleContainer}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.sheetContent}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{ ...initialPin, ...INITIAL_DELTA }}
            showsUserLocation
            showsMyLocationButton
            mapPadding={{ top: 100, right: 16, bottom: 80, left: 16 }}
            onPress={(event) => setDraft(event.nativeEvent.coordinate)}
          >
            <Marker coordinate={draft} pinColor={colors.primary.base} />
          </MapView>

          {/* Floating Pill Header with Shadow */}
          <View style={styles.floatingHeader}>
            <Text style={styles.headerTitle} pointerEvents="none">
              Zaznacz lokalizację
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.confirmButtonPressed,
              ]}
              onPress={() => onConfirm(draft)}
            >
              <Text style={styles.confirmButtonText}>Potwierdź</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    );
  },
);

LocationBottomSheet.displayName = "LocationBottomSheet";

export default LocationBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
  },
  handleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 32, // Creates a generous invisible grab area for panning
    backgroundColor: "transparent",
    zIndex: 100,
  },
  sheetHandle: {
    // Subtle translucent dark handle to ensure it looks good over light or dark map backgrounds
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetContent: {
    flex: 1,
    position: "relative",
    // These radii match the sheet's shape, successfully clipping the
    // absolute map beneath the curves of the bottom sheet
    borderTopLeftRadius: rounded.apple,
    borderTopRightRadius: rounded.apple,
    overflow: "hidden",
  },
  floatingHeader: {
    position: "absolute",
    top: spacing.lg, // Placed safely underneath the handle grab area
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background.card,
    borderRadius: 100, // Gives it a premium "Pill" shape

    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100, // Matches the pill aesthetic
    backgroundColor: colors.primary.base,
  },
  confirmButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  confirmButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
