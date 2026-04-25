import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "kaucjapp_access_token";
const REFRESH_TOKEN_KEY = "kaucjapp_refresh_token";
const ONBOARDING_KEY = "kaucjapp_has_seen_onboarding";

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
