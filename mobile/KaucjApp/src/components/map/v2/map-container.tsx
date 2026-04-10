import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Offer } from "@/src/types";

import MapScreen from "./map-screen";
import OfferSheet from "./offer-sheet";

export default function MapContainer() {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleMarkerPress = useCallback((offer: Offer) => {
    setSelectedOffer(offer);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedOffer(null);
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapScreen
        selectedOffer={selectedOffer}
        onMarkerPress={handleMarkerPress}
      />

      <OfferSheet
        ref={bottomSheetRef}
        offer={selectedOffer}
        onChange={handleSheetChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
