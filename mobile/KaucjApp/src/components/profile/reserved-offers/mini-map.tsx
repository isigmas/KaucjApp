import { colors, rounded } from "@/src/theme";
import { MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

interface MiniMapProps {
  latitude: number;
  longitude: number;
  height?: number;
  style?: ViewStyle;
  interactive?: boolean;
  pointerEvents?: ViewStyle["pointerEvents"];
}

export default function MiniMap({
  latitude,
  longitude,
  height = 140,
  style,
  interactive = false,
  pointerEvents,
}: MiniMapProps) {
  const effectivePointerEvents =
    pointerEvents ?? (interactive ? "auto" : "none");

  return (
    <View
      style={[styles.wrapper, { height }, style]}
      pointerEvents={effectivePointerEvents}
    >
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        liteMode={!interactive}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
        showsScale={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsMyLocationButton={false}
        showsUserLocation={interactive}
        moveOnMarkerPress={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          tracksViewChanges={false}
          anchor={{ x: 0.5, y: 1 }}
        >
          <MapPin
            size={34}
            color={colors.text.white}
            fill={colors.primary.base}
            absoluteStrokeWidth={true}
          />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: rounded.apple,
    overflow: "hidden",
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});
