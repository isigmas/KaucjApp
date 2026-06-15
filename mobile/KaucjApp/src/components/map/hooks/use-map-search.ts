import { useSearchMachines } from "@/src/api/hooks/use-machines";
import { useSearchOffers } from "@/src/api/hooks/use-offer";
import { MachineSearchBBox, MapFilter, OfferSearchBBox } from "@/src/types";

interface UseMapSearchParams {
  bbox: OfferSearchBBox | null;
  filter: MapFilter;
}

// the hook that drives the network layer for the visible map area.
// its only responsibility is to keep the right react-query for the current bounding box and filter.
export function useMapSearch({ bbox, filter }: UseMapSearchParams) {
  const showOffers = filter === "all" || filter === "offers";
  const showMachines = filter === "all" || filter === "machines";

  const offersEnabled = !!bbox && showOffers;
  const machinesEnabled = !!bbox && showMachines;

  const offersQuery = useSearchOffers(bbox as OfferSearchBBox, offersEnabled);
  const machinesQuery = useSearchMachines(
    bbox as MachineSearchBBox,
    machinesEnabled,
  );

  const isFetching =
    (offersEnabled && offersQuery.isFetching) ||
    (machinesEnabled && machinesQuery.isFetching);

  return { offersQuery, machinesQuery, isFetching };
}
