import NetInfo from "@react-native-community/netinfo";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { AppState, Platform } from "react-native";
import { ApiError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

// React Query pauses queries/mutations while offline and automatically
// resumes + refetches them when connectivity returns.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    const online = !!state.isConnected;
    console.log(`[Network] ${online ? "Online" : "Offline"}`);
    setOnline(online);
  }),
);

// returning to the app refetches stale queries.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });
}

// Retry server failures like code 500 up to 3 times
// do not retry client errors like code 401 — they will fail again.
const retryPolicy = (failureCount: number, error: ApiError): boolean => {
  if (error.isClientError) return false;
  return failureCount < 3;
};

export const queryClient = new QueryClient({
  // error logging, fires once per failed query/mutation
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.warn(
        `[Query Error] key=${JSON.stringify(query.queryKey)} → ${error.message}`,
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.warn(
        `[Mutation Error] key=${JSON.stringify(mutation.options.mutationKey ?? "anonymous")} → ${error.message}`,
      );
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // Keep offline data for 7 days
      staleTime: 1000 * 60 * 5,
      retry: retryPolicy,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
