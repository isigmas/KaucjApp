import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";

import { machineKeys } from "@/src/api/hooks/use-machines";
import { offerKeys } from "@/src/api/hooks/use-offer";
import { DepositMachine, MapFilter, Offer } from "@/src/types";

const getOfferId = (offer: Offer) => offer.offerId;
const getMachineId = (machine: DepositMachine) => machine.id;

// this is the hook that returns the offers and machines that should currently be drawn.
export function useMapMarkers(filter: MapFilter) {
  const offersPrefix = useMemo(() => offerKeys.searches(), []);
  const machinesPrefix = useMemo(() => machineKeys.searches(), []);

  const showOffers = filter === "all" || filter === "offers";
  const showMachines = filter === "all" || filter === "machines";

  const offers = useMergedSearchResults<Offer>(
    offersPrefix,
    getOfferId,
    showOffers,
  );
  const machines = useMergedSearchResults<DepositMachine>(
    machinesPrefix,
    getMachineId,
    showMachines,
  );

  return { offers, machines };
}

// Merging data straight from the query cache makes react-query the single source of truth:
// markers persist for as long as their query lives (gcTime), and
// any cache write (status change, refetch, invalidation) is reflected on the marker exactly as it is in the details sheet.
function useMergedSearchResults<T>(
  searchPrefix: QueryKey,
  getId: (item: T) => number,
  enabled: boolean,
): T[] {
  const queryClient = useQueryClient();
  const cacheRef = useRef<Map<number, T>>(new Map());
  const [items, setItems] = useState<T[]>([]);

  const recompute = useCallback(() => {
    if (!enabled) {
      if (cacheRef.current.size > 0) {
        cacheRef.current = new Map();
        setItems([]);
      }
      return;
    }

    const next = new Map<number, T>();
    const entries = queryClient.getQueriesData<T[]>({
      queryKey: searchPrefix,
    });

    for (const [, data] of entries) {
      if (!data) continue;
      for (const item of data) {
        next.set(getId(item), item);
      }
    }

    // this is used to check if the items have changed.
    let changed = next.size !== cacheRef.current.size;
    if (!changed) {
      for (const [id, item] of next) {
        if (cacheRef.current.get(id) !== item) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      cacheRef.current = next;
      setItems(Array.from(next.values()));
    }
  }, [enabled, getId, queryClient, searchPrefix]);

  useEffect(() => {
    recompute();

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const key = event?.query?.queryKey;
      if (key && keyHasPrefix(key, searchPrefix as readonly unknown[])) {
        recompute();
      }
    });

    return unsubscribe;
  }, [queryClient, recompute, searchPrefix]);

  return items;
}

// used to check if the key has the prefix: machine or offer.
function keyHasPrefix(key: QueryKey, prefix: readonly unknown[]): boolean {
  if (key.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (key[i] !== prefix[i]) return false;
  }
  return true;
}
