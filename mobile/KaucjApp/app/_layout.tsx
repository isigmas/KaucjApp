import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/api/query-client";
import { useAuth } from "@/src/auth/use-auth";
import { useAppBootstrap } from "@/src/auth/auth-storage-init";
import { useAppStore } from "@/src/state/app-store";

// COMENTED OUT FOR NOW, EXPO GO DOES NOT SUPPORT REACT QUERY PERSISTENCE, BUT THIS IS HOW IT WOULD LOOK LIKE
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// import { queryClient, queryPersister } from "@/src/api/query-client";

function RootLayoutAuth() {
  const { isAuthenticated } = useAuth();
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const { isReady } = useAppBootstrap();

  if (!isReady) {
    return null; // The native splash screen is covering the app at this point
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!hasSeenOnboarding}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSeenOnboarding && !isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSeenOnboarding && isAuthenticated}>
        <Stack.Screen name="(app)/(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutAuth />
    </QueryClientProvider>
  );
}
