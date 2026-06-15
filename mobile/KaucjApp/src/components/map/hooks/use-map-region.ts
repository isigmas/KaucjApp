import { useEffect, useMemo, useState } from "react";
import { Region } from "react-native-maps";

import { getSnappedBBox } from "@/src/lib";
import { useDebounce } from "@/src/hooks/use-debounce";
import { useUserLocation } from "@/src/hooks/use-user-location";
import { OfferSearchBBox } from "@/src/types";

interface UseMapRegionResult {
  initialRegion: Region | undefined;
  isLocationLoading: boolean;
  // the latest region reported by the map, updated on every pan/zoom.
  region: Region | null;
  setRegion: (region: Region) => void;
  // debounced + grid-snapped bounding box used as the search query key.
  bbox: OfferSearchBBox | null;
}

const REGION_DEBOUNCE_MS = 600;

// the hook that manages the region of the map - where the camera starts, the live region, and the debounced bounding box derived from it.
export function useMapRegion(): UseMapRegionResult {
  const { initialRegion, isLocationLoading } = useUserLocation();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (initialRegion && !region) {
      setRegion(initialRegion);
    }
  }, [initialRegion, region]);

  const debouncedRegion = useDebounce(region, REGION_DEBOUNCE_MS);

  // snapping to a grid, so react-query can serve cached results instead of refetching on every gesture.
  const bbox = useMemo(
    () => (debouncedRegion ? getSnappedBBox(debouncedRegion) : null),
    [debouncedRegion],
  );

  return { initialRegion, isLocationLoading, region, setRegion, bbox };
}
