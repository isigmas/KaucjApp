import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../api-client";
import {
  DepositMachine,
  DepositMachineStatus,
  MachineSearchBBox,
} from "@/src/types";
import { ApiErrorResponse } from "@/src/types";

export const machineKeys = {
  all: () => ["machines"] as const,
  lists: () => [...machineKeys.all(), "list"] as const,
  search: (box: MachineSearchBBox) =>
    [...machineKeys.all(), "search", box] as const,
  detail: (id: number) => [...machineKeys.all(), "detail", id] as const,
};

export const useAllMachines = () => {
  return useQuery<DepositMachine[], AxiosError<ApiErrorResponse>>({
    queryKey: machineKeys.lists(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<DepositMachine[]>("/deposit/machines");
      return data;
    },
  });
};

export const useSearchMachines = (
  box: MachineSearchBBox,
  enabled: boolean = true,
) => {
  return useQuery<DepositMachine[], AxiosError<ApiErrorResponse>>({
    queryKey: machineKeys.search(box),
    queryFn: async () => {
      const { data } = await apiClient.get<DepositMachine[]>(
        "/deposit/search",
        { params: box },
      );
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useMachineDetails = (id: number) => {
  return useQuery<DepositMachine, Error>({
    queryKey: machineKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<DepositMachine>(
        `/deposit/machine/${id}`,
      );
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useUpdateMachineStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    { id: number; status: DepositMachineStatus },
    // Define the context type for our rollback data
    {
      previousDetail: DepositMachine | undefined;
      previousLists: [QueryKey, DepositMachine[] | undefined][];
    }
  >({
    mutationFn: async ({ id, status }) => {
      await apiClient.patch(`/deposit/machine/${id}`, { status });
    },

    // Fires immediately when mutation is called, before the API request finishes
    onMutate: async ({ id, status }) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: machineKeys.all() });

      // 2. Snapshot the current state for a potential rollback
      const previousDetail = queryClient.getQueryData<DepositMachine>(
        machineKeys.detail(id),
      );
      const previousLists = queryClient.getQueriesData<DepositMachine[]>({
        queryKey: machineKeys.all(),
      });

      // 3. Optimistically update the detail query cache (Instantly updates Bottom Sheet)
      if (previousDetail) {
        queryClient.setQueryData<DepositMachine>(machineKeys.detail(id), {
          ...previousDetail,
          status,
        });
      }

      // 4. Optimistically update all list/search queries (Instantly updates Map Markers)
      queryClient.setQueriesData<DepositMachine[]>(
        { queryKey: machineKeys.all() },
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.map((m) => (m.id === id ? { ...m, status } : m));
          }
          return oldData;
        },
      );

      // Return the snapshots to the context
      return { previousDetail, previousLists };
    },

    // If the API call fails, use the context to roll the cache back
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          machineKeys.detail(variables.id),
          context.previousDetail,
        );
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },

    // Always refetch after error or success to ensure backend sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.all() });
    },
  });
};
