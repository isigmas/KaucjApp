import { spacing } from "@/src/theme";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapErrorBanner from "./map-error-banner";
import { MapItemType } from "@/src/types";

export interface MapErrorDescriptor {
  type: MapItemType;
  message: string;
  onRetry: () => void | Promise<unknown>;
}

interface MapErrorOverlayProps {
  errors: MapErrorDescriptor[];
}

const FILTER_ZONE = 60;
const TOP_OFFSET = (Constants.statusBarHeight ?? 0) + FILTER_ZONE;

// Wrapper for the error banners.
function MapErrorOverlay({ errors }: MapErrorOverlayProps) {
  const [dismissed, setDismissed] = useState<Set<MapItemType>>(new Set());

  useEffect(() => {
    const activeTypes = new Set(errors.map((e) => e.type));
    setDismissed((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const type of prev) {
        if (!activeTypes.has(type)) {
          next.delete(type);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [errors]);

  const visibleErrors = errors.filter((e) => !dismissed.has(e.type));

  if (visibleErrors.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visibleErrors.map((error) => (
        <MapErrorBanner
          key={error.type}
          message={error.message}
          onRetry={error.onRetry}
          onDismiss={() =>
            setDismissed((prev) => new Set(prev).add(error.type))
          }
        />
      ))}
    </View>
  );
}

export default React.memo(MapErrorOverlay);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: TOP_OFFSET,
    left: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
});
