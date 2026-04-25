import { create } from "zustand";
import { appStorage } from "@/src/auth/secure-storage";

interface AppState {
  hasSeenOnboarding: boolean;
  isHydrating: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  hydrateApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenOnboarding: false,
  isHydrating: true,

  completeOnboarding: async () => {
    await appStorage.setOnboardingSeen();
    set({ hasSeenOnboarding: true });
  },

  //only for testing not used in the app
  resetOnboarding: async () => {
    await appStorage.clearOnboarding();
    set({ hasSeenOnboarding: false });
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
