import * as SecureStore from "expo-secure-store";
import { User } from "../types/user";

const ACCESS_TOKEN_KEY = "kaucjapp_access_token";
const REFRESH_TOKEN_KEY = "kaucjapp_refresh_token";
const ONBOARDING_KEY = "kaucjapp_has_seen_onboarding";
const USER_DATA_KEY = "kaucjapp_user_data";

export const tokenStorage = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

export const authStorage = {
  setUserData: async (user: User) => {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  },
  getUserData: async (): Promise<User | null> => {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },
  clearUserData: async () => {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  },
};

export const appStorage = {
  setOnboardingSeen: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
  },
  getOnboardingSeen: async () => {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === "true";
  },

  //only for testing not used in the app
  clearOnboarding: async () => {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  },
};
