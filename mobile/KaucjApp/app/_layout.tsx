import { queryClient } from "@/src/api/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
