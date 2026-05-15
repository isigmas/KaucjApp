import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { Rating, RatingPayload } from "@/src/types";

export const useUserRating = (userId: number) => {
  return useQuery({
    queryKey: ["userRating", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}/rating`);
      console.log(JSON.stringify(data, null, 2));
      return data as Rating;
    },
  });
};

export const useAddRating = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RatingPayload) => {
      const { data } = await apiClient.post(`/user/${userId}/rating`, payload);
      console.log(JSON.stringify(data, null, 2));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRating", userId] });
    },
  });
};
