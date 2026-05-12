import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "./auth-store";
import { useAppStore } from "../state/app-store";
import { apiClient } from "../api/api-client";

SplashScreen.preventAutoHideAsync();

//This component is responsible for keeping the splash screen visible while we check for an existing auth session and hydrate our auth state.
//Used ONLY in the RootLayout
export const useAppBootstrap = () => {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const isAuthHydrating = useAuthStore((state) => state.isHydrating);

  const hydrateApp = useAppStore((state) => state.hydrateApp);
  const isAppHydrating = useAppStore((state) => state.isHydrating);

  // 1. Kick off hydration for both stores on mount
  useEffect(() => {
    hydrateAuth(apiClient);
    hydrateApp();
  }, [hydrateAuth, hydrateApp]);

  const isReady = !isAuthHydrating && !isAppHydrating;

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 50);
    }
  }, [isReady]);

  return {
    isReady,
  };
};
