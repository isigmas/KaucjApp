import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { apiClient } from "../api-client";

import {
  DepositMachine,
  DepositMachineStatus,
  MachineSearchBBox,
} from "@/src/types";

export const machineKeys = {
  all: ["machines"] as const,
  searches: () => [...machineKeys.all, "search"] as const,
  search: (box: MachineSearchBBox) => [...machineKeys.searches(), box] as const,
  details: () => [...machineKeys.all, "detail"] as const,
  detail: (id: number) => [...machineKeys.details(), id] as const,
  reviews: (machineId: number) =>
    [...machineKeys.all, "reviews", machineId] as const,
  reviewCheck: (machineId: number) =>
    [...machineKeys.all, "review-check", machineId] as const,
};

// GET /deposit/search - machines within the visible map area
export const useSearchMachines = (
  box: MachineSearchBBox,
  enabled: boolean = true,
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: machineKeys.search(box),
    queryFn: async () => {
      const { data } = await apiClient.get<DepositMachine[]>(
        "/deposit/search",
        { params: box },
      );

      // Seed each machine into the detail cache: the backend returns the same
      // DTO for search and detail, so opening a marker's bottom sheet renders
      // instantly from cache instead of hitting /deposit/machine/{id}.
      data.forEach((machine) => {
        queryClient.setQueryData(machineKeys.detail(machine.id), machine);
      });

      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    // Every map pan creates a new bbox key — keep these short-lived to avoid
    // accumulating dozens of stale search snapshots in memory.
    gcTime: 1000 * 60 * 30,
  });
};

// GET /deposit/machine/{id} - single machine (usually pre-seeded by search)
export const useMachineDetails = (id: number) => {
  return useQuery({
    queryKey: machineKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<DepositMachine>(
        `/deposit/machine/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
};

// PATCH /deposit/machine/{id} - report machine status, with optimistic update
export const useUpdateMachineStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: number; status: DepositMachineStatus },
    // Snapshots for rollback on failure
    {
      previousDetail: DepositMachine | undefined;
      previousSearches: [QueryKey, DepositMachine[] | undefined][];
    }
  >({
    mutationFn: async ({ id, status }) => {
      await apiClient.patch(`/deposit/machine/${id}`, { status });
    },

    // Fires immediately when mutation is called, before the API request finishes
    onMutate: async ({ id, status }) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: machineKeys.all });

      // 2. Snapshot the current state for a potential rollback
      const previousDetail = queryClient.getQueryData<DepositMachine>(
        machineKeys.detail(id),
      );
      const previousSearches = queryClient.getQueriesData<DepositMachine[]>({
        queryKey: machineKeys.searches(),
      });

      // 3. Optimistically update the detail query cache (Instantly updates Bottom Sheet)
      if (previousDetail) {
        queryClient.setQueryData<DepositMachine>(machineKeys.detail(id), {
          ...previousDetail,
          status,
        });
      }

      // 4. Optimistically update all search queries (Instantly updates Map Markers)
      queryClient.setQueriesData<DepositMachine[]>(
        { queryKey: machineKeys.searches() },
        (oldData) => oldData?.map((m) => (m.id === id ? { ...m, status } : m)),
      );

      return { previousDetail, previousSearches };
    },

    // If the API call fails, use the context to roll the cache back
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          machineKeys.detail(variables.id),
          context.previousDetail,
        );
      }
      context?.previousSearches.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    // Always refetch after error or success to ensure backend sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.all });
    },
  });
};
