import { create } from "zustand";
import { tokenStorage } from "./secure-storage";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrating: boolean; // Tells the app if we are checking SecureStore on startup
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  updateTokens: (
    newAccessToken: string,
    newRefreshToken: string,
  ) => Promise<void>;
  purgeAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    console.log("[Auth Store] User authenticated, tokens stored securely.");
    set({ user, accessToken, isHydrating: false });
    console.log("[Auth Store] State updated with user and access token.");
  },

  updateTokens: async (newAccessToken, newRefreshToken) => {
    await tokenStorage.setTokens(newAccessToken, newRefreshToken);
    set({ accessToken: newAccessToken });
  },

  purgeAuth: async () => {
    await tokenStorage.clearTokens();
    set({ user: null, accessToken: null, isHydrating: false });
  },

  // On app startup, check if we have tokens in SecureStore and validate them
  hydrate: async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        // decode JWT or fetch user info
        set({
          user: {
            id: "1",
            email: "user@test.com",
            name: "Zalogowany Użytkownik",
          },
          accessToken: token,
          isHydrating: false,
        });
      } else {
        set({ isHydrating: false });
      }
    } catch {
      set({ isHydrating: false });
    }
  },
}));
