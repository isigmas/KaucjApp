import { useMemo } from "react";
import { MapErrorDescriptor } from "@/src/components/map/overlay/map-error-overlay";
import { MapFilter, MapItemType } from "@/src/types";

interface CategoryErrorState {
  isError: boolean;
  refetch: () => void | Promise<unknown>;
}

interface UseMapErrorsArgs {
  filter: MapFilter;
  offersError: CategoryErrorState;
  machinesError: CategoryErrorState;
}

//categories are there to check if the error is relevant to the current filter. meaning no offer errors when the filter is machines.
const CATEGORIES: {
  type: MapItemType;
  message: string;
  hiddenForFilter: MapFilter;
}[] = [
  {
    type: "offer",
    message: "Nie udało się załadować ofert.",
    hiddenForFilter: "machines",
  },
  {
    type: "machine",
    message: "Nie udało się załadować kaucjomatów.",
    hiddenForFilter: "offers",
  },
];

export function useMapErrors({
  filter,
  offersError,
  machinesError,
}: UseMapErrorsArgs): MapErrorDescriptor[] {
  const stateById: Record<MapItemType, CategoryErrorState> = {
    offer: offersError,
    machine: machinesError,
  };

  return useMemo(
    () =>
      CATEGORIES.filter(
        (category) =>
          filter !== category.hiddenForFilter &&
          stateById[category.type].isError,
      ).map((category) => ({
        type: category.type,
        message: category.message,
        onRetry: stateById[category.type].refetch,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filter,
      offersError.isError,
      offersError.refetch,
      machinesError.isError,
      machinesError.refetch,
    ],
  );
}
