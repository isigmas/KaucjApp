import { create } from "zustand";

interface LocationStore {
  pickedLocation: { latitude: number; longitude: number } | null;
  setPickedLocation: (coords: { latitude: number; longitude: number }) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  pickedLocation: null,
  setPickedLocation: (coords) => set({ pickedLocation: coords }),
  clearLocation: () => set({ pickedLocation: null }),
}));
