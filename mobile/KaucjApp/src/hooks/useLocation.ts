import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  /** Current user coordinates, or `null` while loading / denied. */
  coords: UserCoords | null;
  /** Whether we are still resolving permissions + fetching location. */
  loading: boolean;
  /** Human-readable error string (permission denied, timeout, etc.). */
  errorMsg: string | null;
}

/**
 * Custom hook that requests foreground location permission and returns the
 * device's current coordinates.
 *
 * Usage:
 * ```ts
 * const { coords, loading, errorMsg } = useLocation();
 * ```
 */
export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Brak uprawnień do lokalizacji. Włącz je w ustawieniach.");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch {
        if (!cancelled) {
          setErrorMsg("Nie udało się pobrać lokalizacji.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, loading, errorMsg };
}
