import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { DepositMachine } from "../../../constants";

interface MachineMarkerProps {
  machine: DepositMachine;
  onPress: (machine: DepositMachine) => void;
}

export const MachineMarker = React.memo(
  ({ machine, onPress }: MachineMarkerProps) => {
    const [isTracking, setIsTracking] = useState(true);

    const handleLayout = useCallback(() => {
      if (isTracking) setIsTracking(false);
    }, [isTracking]);

    const getMarkerConfig = () => {
      switch (machine.status) {
        case "AVAILABLE":
          return { color: "#2196F3", shadow: "rgba(33, 150, 243, 0.4)" }; // Blue
        case "FULL":
          return { color: "#FF9800", shadow: "rgba(255, 152, 0, 0.4)" }; // Orange
        case "OUT_OF_ORDER":
          return { color: "#F44336", shadow: "rgba(244, 67, 54, 0.4)" }; // Red
        default:
          return { color: "#9E9E9E", shadow: "rgba(158, 158, 158, 0.4)" }; // Grey
      }
    };

    const config = getMarkerConfig();

    return (
      <Marker
        coordinate={{
          latitude: machine.latitude,
          longitude: machine.longitude,
        }}
        onPress={() => onPress(machine)}
        tracksViewChanges={isTracking}
        icon={undefined}
      >
        <View style={styles.container} onLayout={handleLayout}>
          <View
            style={[
              styles.pinRing,
              { borderColor: config.color, shadowColor: config.shadow },
            ]}
          >
            <View style={[styles.pinCore, { backgroundColor: config.color }]} />
          </View>
          <View style={[styles.triangle, { borderTopColor: config.color }]} />
        </View>
      </Marker>
    );
  },
  (prevProps, nextProps) =>
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
