import { useCallback, useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

import { DepositMachine, Offer, SelectedMapItem } from "@/src/types";

// the hook that manages the selection of the map item and is the bridge to the bottom sheet.
export function useMapSelection() {
  const [selectedItem, setSelectedItem] = useState<SelectedMapItem | null>(
    null,
  );
  const bottomSheetRef = useRef<BottomSheet>(null);

  const selectOffer = useCallback((offer: Offer) => {
    setSelectedItem({
      type: "offer",
      id: offer.offerId,
      latitude: offer.latitude,
      longitude: offer.longitude,
    });
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const selectMachine = useCallback((machine: DepositMachine) => {
    setSelectedItem({
      type: "machine",
      id: machine.id,
      latitude: machine.latitude,
      longitude: machine.longitude,
    });
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedItem(null);
    }
  }, []);

  return {
    selectedItem,
    bottomSheetRef,
    selectOffer,
    selectMachine,
    handleSheetChange,
  };
}
