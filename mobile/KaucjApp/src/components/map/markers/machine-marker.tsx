import { DepositMachine, DepositMachineStatus } from "@/src/types";
import React from "react";
import { ImageSourcePropType, StyleSheet, Image } from "react-native";
import { Marker } from "react-native-maps";
import { useMarkerTracking } from "./use-marker-tracking";

interface MachineMarkerProps {
  machine: DepositMachine;
  onPress: (machine: DepositMachine) => void;
}

const markerImages: Record<DepositMachineStatus, ImageSourcePropType> = {
  AVAILABLE: require("@/assets/images/markers/deposit_marker_green.png"),
  FULL: require("@/assets/images/markers/deposit_marker_yellow.png"),
  OUT_OF_ORDER: require("@/assets/images/markers/deposit_marker_red.png"),
};

export const MachineMarker = React.memo(
  ({ machine, onPress }: MachineMarkerProps) => {
    // this forces a fresh native snapshot - in other words - it forces the marker to be re-rendered and updates the color of the marker.
    const { tracksViewChanges, onRendered } = useMarkerTracking(machine.status);

    return (
      <Marker
        identifier={`machine-${machine.id}`}
        coordinate={{
          latitude: machine.latitude,
          longitude: machine.longitude,
        }}
        onPress={() => onPress(machine)}
        tracksViewChanges={tracksViewChanges}
        //those props move the marker up so it reflects correct position on the map
        anchor={{ x: 0.5, y: 1 }}
        centerOffset={{ x: 0, y: -20 }}
      >
        <Image
          source={markerImages[machine.status]}
          onLoad={onRendered}
          style={styles.pin}
          resizeMode="contain"
          // Android needs this to avoid re-decoding the asset on every redraw.
          fadeDuration={0}
        />
      </Marker>
    );
  },
  (prevProps, nextProps) =>
    prevProps.machine.id === nextProps.machine.id &&
    prevProps.machine.status === nextProps.machine.status &&
    prevProps.machine.latitude === nextProps.machine.latitude &&
    prevProps.machine.longitude === nextProps.machine.longitude,
);

MachineMarker.displayName = "MachineMarker";

const MARKER_SIZE = 50;
const styles = StyleSheet.create({
  pin: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
  },
});
