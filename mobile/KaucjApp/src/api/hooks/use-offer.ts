import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";

export const useGetOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/offer/test");
      return data;
    },
  });
};
