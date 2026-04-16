import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../api-client";
import { DepositMachine, MachineSearchBBox } from "@/src/types";
import { ApiErrorResponse } from "@/src/types";

export const machineKeys = {
  all: () => ["machines"] as const,
  lists: () => [...machineKeys.all(), "list"] as const,
  search: (box: MachineSearchBBox) =>
    [...machineKeys.all(), "search", box] as const,
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
        {
          params: box,
        },
      );
      return data;
    },
    enabled,
  });
};
