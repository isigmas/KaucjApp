import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { useLocationStore } from "@/src/state/location";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MapSheetScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation();
  const pickedLocation = useLocationStore((state) => state.pickedLocation);
  const setPickedLocation = useLocationStore(
    (state) => state.setPickedLocation,
  );

  // Kraków Fallback
  const KRAKOW_REGION = {
    latitude: 50.0647,
    longitude: 19.945,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // 2. Determine the starting point (Store > Fallback)
  const initialStartingRegion = pickedLocation
    ? {
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
        latitudeDelta: 0.01, // Keep it nicely zoomed in on their pin
        longitudeDelta: 0.01,
      }
    : KRAKOW_REGION;

  // 3. Initialize state with our chosen starting point
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: initialStartingRegion.latitude,
    longitude: initialStartingRegion.longitude,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleConfirm} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Potwierdź</Text>
        </Pressable>
      ),
    });
  }, [navigation, selectedCoordinate]);

  useEffect(() => {
    if (pickedLocation) {
      const cords = {
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
      };
      mapRef.current?.animateToRegion(
        {
          ...cords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        3000,
      );
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setSelectedCoordinate(newCoords);

          mapRef.current?.animateToRegion(
            {
              ...newCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }
      } catch (error) {
        console.warn("Could not fetch location", error);
      }
    })();
  }, []);

  const handleMapPress = (e: any) => {
    setSelectedCoordinate(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    // TODO: Save selectedCoordinate.
    console.log("Selected coordinate:", selectedCoordinate);

    setPickedLocation({
      latitude: selectedCoordinate.latitude,
      longitude: selectedCoordinate.longitude,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={KRAKOW_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={selectedCoordinate}
          pinColor={colors.primary.base}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.background.main,
    marginTop: -100,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerButton: {
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
  headerButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
