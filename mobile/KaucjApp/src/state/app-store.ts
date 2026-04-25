import { create } from "zustand";
import { appStorage } from "@/src/auth/secure-storage";

interface AppState {
  hasSeenOnboarding: boolean;
  isHydrating: boolean;
  completeOnboarding: () => Promise<void>;
  hydrateApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenOnboarding: false,
  isHydrating: true,

  completeOnboarding: async () => {
    await appStorage.setOnboardingSeen();
    set({ hasSeenOnboarding: true });
  },

  hydrateApp: async () => {
    try {
      const hasSeen = await appStorage.getOnboardingSeen();
      set({
        hasSeenOnboarding: hasSeen,
        isHydrating: false,
      });
    } catch {
      set({ isHydrating: false });
    }
  },
}));
