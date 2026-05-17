import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { Rating, RatingPayload, Review } from "@/src/types";

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
      await apiClient.post(`/user/${userId}/rating`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRating", userId] });
    },
  });
};

export const useReviews = (userId: number) => {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}/reviews`);
      console.log(JSON.stringify(data, null, 2));
      return data as Review[];
    },
  });
};
