import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

/**
 * Reactive connectivity status, backed by React Query's onlineManager
 * (which is fed by NetInfo in query-client.ts). Using the same source of
 * truth as the query layer guarantees the UI and cache never disagree
 * about whether the app is online.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
  );
}
