import { useState } from "react";

import { MapFilter } from "@/src/types";
import { useMapMarkers } from "./use-map-markers";
import { useMapRegion } from "./use-map-region";
import { useMapSearch } from "./use-map-search";
import { useMapSelection } from "./use-map-selection";
import { useMapErrors } from "./use-map-errors";

export function useMapController() {
  const [filter, setFilter] = useState<MapFilter>("all");

  const { initialRegion, isLocationLoading, setRegion, bbox } = useMapRegion();

  const { offersQuery, machinesQuery, isFetching } = useMapSearch({
    bbox,
    filter,
  });

  const { offers, machines } = useMapMarkers(filter);

  const offersError = {
    isError: offersQuery.isError,
    error: offersQuery.error,
    refetch: offersQuery.refetch,
  };
  const machinesError = {
    isError: machinesQuery.isError,
    error: machinesQuery.error,
    refetch: machinesQuery.refetch,
  };

  const errors = useMapErrors({ filter, offersError, machinesError });

  const selection = useMapSelection();

  return {
    // filtering
    filter,
    setFilter,

    // camera / loading
    initialRegion,
    isLocationLoading,
    onRegionChange: setRegion,

    // marker data
    offers,
    machines,
    isFetching,

    // error surfaces for each category
    errors,

    // this is the bridge between the map and the bottom sheet.
    selection,
  };
}
