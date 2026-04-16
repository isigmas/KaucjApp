import React, { forwardRef, useMemo } from "react";
import { Text, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { rounded } from "@/src/theme";
import { SelectedMapItem } from "./map-container";
import OfferDetails from "./details/offer-details";
import MachineDetails from "./details/machine-details";

interface DetailsSheetProps {
  selectedItem: SelectedMapItem | null;
  onChange?: (index: number) => void;
}

const DetailsSheet = forwardRef<BottomSheet, DetailsSheetProps>(
  ({ selectedItem, onChange }, ref) => {
    const snapPoints = useMemo(() => ["50%", "90%"], []);

    const renderContent = () => {
      if (!selectedItem) {
        return (
          <Text style={styles.errorText}>Brak wybranego markera na mapie.</Text>
        );
      }

      if (selectedItem.type === "offer") {
        return <OfferDetails offer={selectedItem.data} />;
      }

      if (selectedItem.type === "machine") {
        return <MachineDetails machine={selectedItem.data} />;
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onChange={onChange}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default DetailsSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#ffffff",
    borderRadius: rounded.apple,
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
  errorText: {
    textAlign: "center",
    marginTop: 20,
  },
});
