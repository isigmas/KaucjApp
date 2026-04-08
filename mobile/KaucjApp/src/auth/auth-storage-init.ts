import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "./auth-store";

SplashScreen.preventAutoHideAsync();

//This component is responsible for keeping the splash screen visible while we check for an existing auth session and hydrate our auth state.
//Used ONLY in the RootLayout
export const useAuthBootstrap = () => {
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrating) {
      SplashScreen.hideAsync();
    }
  }, [isHydrating]);

  return {
    isReady: !isHydrating,
  };
};
