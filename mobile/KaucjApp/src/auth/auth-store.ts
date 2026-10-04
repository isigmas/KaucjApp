import { create } from "zustand";
import { authStorage, tokenStorage } from "./secure-storage";
import { User } from "@/src/types/user";
import { AxiosInstance } from "axios";

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
  hydrate: (apiClient: AxiosInstance) => Promise<void>;

  patchUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isHydrating: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    await authStorage.setUserData(user);
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
    await authStorage.clearUserData();
    set({ user: null, accessToken: null, isHydrating: false });
  },

  patchUser: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };

    await authStorage.setUserData(updatedUser);
    set({ user: updatedUser });
  },

  hydrate: async (apiClient) => {
    try {
      const token = await tokenStorage.getAccessToken();
      const cachedUser = await authStorage.getUserData();

      if (token && cachedUser) {
        set({
          user: cachedUser,
          accessToken: token,
          isHydrating: false,
        });

        // in the background we verify the user data by fetching it from the API
        apiClient
          .get("/user/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(({ data: userData }) => {
            const freshUser: User = {
              userId: userData.userId,
              username: userData.username,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              addresses: userData.addresses,
              createdAt: userData.createdAt,
              collectedBottleCount: userData.collectedBottleCount,
              collectedCanCount: userData.collectedCanCount,
              returnedBottleCount: userData.returnedBottleCount,
              returnedCanCount: userData.returnedCanCount,
              returnedTotalCount: userData.returnedTotalCount,
              collectedTotalCount: userData.collectedTotalCount,
            };
            set({ user: freshUser });
            authStorage.setUserData(freshUser);
          })
          .catch((err) => {
            console.warn("Background /me fetch failed", err);
          });
      } else {
        set({ isHydrating: false });
      }
    } catch {
      set({ isHydrating: false });
    }
  },
}));
