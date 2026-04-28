import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Offer, DepositMachine } from "@/src/types";

import MapScreen from "./map-screen";
import DetailsSheet from "./details-sheet";

export type SelectedMapItem =
  | { type: "offer"; data: Offer }
  | { type: "machine"; data: DepositMachine; id: number };

export default function MapContainer() {
  const [selectedItem, setSelectedItem] = useState<SelectedMapItem | null>(
    null,
  );
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOfferPress = useCallback((offer: Offer) => {
    setSelectedItem({ type: "offer", data: offer });
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleMachinePress = useCallback((machine: DepositMachine) => {
    setSelectedItem({ type: "machine", data: machine, id: machine.id });
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedItem(null);
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapScreen
        selectedItem={selectedItem}
        onOfferPress={handleOfferPress}
        onMachinePress={handleMachinePress}
      />

      <DetailsSheet
        ref={bottomSheetRef}
        selectedItem={selectedItem}
        onChange={handleSheetChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
