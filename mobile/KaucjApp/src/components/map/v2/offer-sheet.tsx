import React, { forwardRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Offer } from "@/src/types";
import OfferDetails from "./offer-details";

interface OfferSheetProps {
  offer: Offer | null;
  onChange?: (index: number) => void;
}

const OfferSheet = forwardRef<BottomSheet, OfferSheetProps>(
  ({ offer, onChange }, ref) => {
    const snapPoints = useMemo(() => ["50%", "90%"], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true} // Allows user to swipe it away
        onChange={onChange}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {offer ? <OfferDetails offer={offer} /> : null}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default OfferSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
});
