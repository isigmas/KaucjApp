import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

export const useGetData = () => {
  return useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const { data } = await apiClient.get("/endpoint");
      return data;
    },
  });
};
