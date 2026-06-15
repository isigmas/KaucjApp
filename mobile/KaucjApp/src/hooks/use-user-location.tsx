import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Region } from "react-native-maps";

const DEFAULT_REGION: Region = {
  latitude: 49.4778,
  longitude: 20.0323,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const useUserLocation = () => {
  const [initialRegion, setInitialRegion] = useState<Region | undefined>(
    undefined,
  );
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.warn(
            "Permission to access location was denied. Falling back to default region.",
          );
          if (isMounted) setInitialRegion(DEFAULT_REGION);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setInitialRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user location:", error);
        if (isMounted) setInitialRegion(DEFAULT_REGION);
      } finally {
        if (isMounted) setIsLocationLoading(false);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { initialRegion, isLocationLoading };
};
