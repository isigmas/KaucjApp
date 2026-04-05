import { Stack } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/api/query-client";

// COMENTED OUT FOR NOW, EXPO GO DOES NOT SUPPORT REACT QUERY PERSISTENCE, BUT THIS IS HOW IT WOULD LOOK LIKE
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// import { queryClient, queryPersister } from "@/src/api/query-client";

function RootLayoutAuth() {
  const isAuthenticated = false; //  replace with real auth logic  based on the session

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="(app)/(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
