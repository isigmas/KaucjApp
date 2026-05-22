import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import {
  UserRating,
  Review,
  UserReviewPayload,
  MachineReviewPayload,
} from "@/src/types";
import { machineKeys } from "./use-machines";

export const useUserRating = (userId: number) => {
  return useQuery({
    queryKey: ["userRating", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}/rating`);
      console.log(JSON.stringify(data, null, 2));
      return data as UserRating;
    },
  });
};

export const useUserReviewCheck = (offerId: number, userId: number) => {
  return useQuery({
    queryKey: ["userReviewCheck", offerId, userId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/user/reviews/check?offerId=${offerId}`,
      );
      return data as { alreadyReviewed: boolean };
    },
  });
};

export const useAddUserReview = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UserReviewPayload) => {
      await apiClient.post(`/user/${userId}/rating`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["userRating", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userReviews", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userReviewCheck", userId],
        }),
        ,
      ]);
    },
  });
};

export const useUserReviews = (userId: number) => {
  return useQuery({
    queryKey: ["userReviews", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}/reviews`);
      console.log(JSON.stringify(data, null, 2));
      return data as Review[];
    },
  });
};

export const useMachineReviews = (machineId: number) => {
  return useQuery({
    queryKey: ["machineReviews", machineId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/deposit/machine/${machineId}/reviews`,
      );
      console.log(JSON.stringify(data, null, 2));
      return data as Review[];
    },
  });
};

export const useAddMachineReview = (machineId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MachineReviewPayload) => {
      await apiClient.post(`/deposit/machine/${machineId}/rating`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: machineKeys.detail(machineId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["machineReviews", machineId],
        }),
      ]);
    },
  });
};
