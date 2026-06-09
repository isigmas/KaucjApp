import { getMachineStatusConfig } from "@/src/lib";
import { DepositMachine, DepositMachineStatus } from "@/src/types";
import { preventAutoHideAsync } from "expo-splash-screen";
import React, { useState, useCallback } from "react";
// Add Image to your react-native imports
import { ImageSourcePropType, StyleSheet, View, Image } from "react-native";
import { Marker } from "react-native-maps";

interface MachineMarkerProps {
  machine: DepositMachine;
  onPress: (machine: DepositMachine) => void;
}

// A dictionary of a marker status and a marker image
const markerImages: Record<DepositMachineStatus, ImageSourcePropType> = {
  AVAILABLE: require("@/assets/images/markers/deposit_marker_green.png"),
  FULL: require("@/assets/images/markers/deposit_marker_yellow.png"),
  OUT_OF_ORDER: require("@/assets/images/markers/deposit_marker_red.png"),
};

export const MachineMarker = React.memo(
  ({ machine, onPress }: MachineMarkerProps) => {
    const [isTracking, setIsTracking] = useState(true);

    const handleLayout = useCallback(() => {
      if (isTracking) setIsTracking(false);
    }, [isTracking]);

    const config = getMachineStatusConfig(machine.status);

    return (
      <Marker
        identifier={`machine-${machine.id}`}
        coordinate={{
          latitude: machine.latitude,
          longitude: machine.longitude,
        }}
        onPress={() => onPress(machine)}
        tracksViewChanges={isTracking}
      >
        <Image
          source={markerImages[machine.status]}
          onLoad={handleLayout} // Stops tracking once the image successfully loads
          style={{ width: 50, height: 50 }} // Adjust dimensions to match your asset sizes
          resizeMode="contain"
        />
      </Marker>
    );
  },
  (prevProps, nextProps) =>
    prevProps.machine.id === nextProps.machine.id &&
    prevProps.machine.status === nextProps.machine.status,
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  pinRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    // Shadows
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  pinCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2, // Pull it up slightly to overlap the circle seamlessly
  },
});
