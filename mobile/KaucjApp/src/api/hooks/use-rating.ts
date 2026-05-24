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
    queryKey: ["userReviewCheck", userId, offerId],
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

export const useUpdateUserReview = (reviewId: number, userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UserReviewPayload) => {
      await apiClient.patch(`/user/reviews/${reviewId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRating", userId],
      });
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

// ----- Machine Reviews -----

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

export const useMachineReviewCheck = (machineId: number) => {
  return useQuery({
    queryKey: ["machineReviewCheck", machineId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/deposit/reviews/check`, {
        params: { id: machineId },
      });
      return data as { alreadyReviewed: boolean; review: Review | null };
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

export const useUpdateMachineReview = (reviewId: number, machineId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MachineReviewPayload) => {
      await apiClient.patch(`/deposit/reviews/${reviewId}`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: machineKeys.detail(machineId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["machineReviews", machineId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["machineReviewCheck", machineId],
        }),
      ]);
    },
  });
};
