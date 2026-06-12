import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";

import {
  UserRating,
  Review,
  ReviewCheck,
  UserReviewPayload,
  MachineReviewPayload,
} from "@/src/types";
import { userKeys } from "./use-user";
import { machineKeys } from "./use-machines";

// ----- User Reviews -----
export const useUserRating = (userId: number) => {
  return useQuery({
    queryKey: userKeys.rating(userId),
    queryFn: async () => {
      const { data } = await apiClient.get<UserRating>(
        `/user/${userId}/rating`,
      );
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserReviews = (userId: number) => {
  return useQuery({
    queryKey: userKeys.reviews(userId),
    queryFn: async () => {
      const { data } = await apiClient.get<Review[]>(`/user/${userId}/reviews`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserReviewCheck = (offerId: number, userId: number) => {
  return useQuery({
    queryKey: userKeys.reviewCheck(userId, offerId),
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewCheck>(`/user/reviews/check`, {
        params: { offerId },
      });
      return data;
    },
    enabled: !!offerId && !!userId,
  });
};

const invalidateUserRatings = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: number,
) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: userKeys.rating(userId) }),
    queryClient.invalidateQueries({ queryKey: userKeys.reviews(userId) }),
    queryClient.invalidateQueries({ queryKey: userKeys.reviewChecks(userId) }),
  ]);

export const useAddUserReview = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserReviewPayload) => {
      await apiClient.post(`/user/${userId}/rating`, payload);
    },
    onSuccess: async () => {
      await invalidateUserRatings(queryClient, userId);
    },
  });
};

export const useUpdateUserReview = (reviewId: number, userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserReviewPayload) => {
      await apiClient.patch(`/user/reviews/${reviewId}`, payload);
    },
    onSuccess: async () => {
      await invalidateUserRatings(queryClient, userId);
    },
  });
};

// ----- Machine Reviews -----

export const useMachineReviews = (machineId: number) => {
  return useQuery({
    queryKey: machineKeys.reviews(machineId),
    queryFn: async () => {
      const { data } = await apiClient.get<Review[]>(
        `/deposit/machine/${machineId}/reviews`,
      );
      return data;
    },
    enabled: !!machineId,
  });
};

export const useMachineReviewCheck = (machineId: number) => {
  return useQuery({
    queryKey: machineKeys.reviewCheck(machineId),
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewCheck>(
        `/deposit/reviews/check`,
        { params: { id: machineId } },
      );
      return data;
    },
    enabled: !!machineId,
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
          queryKey: machineKeys.reviews(machineId),
        }),
      ]);
      // The timeout here is to show the SuccessState for 3 seconds, TODO: future improvement.
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: machineKeys.reviewCheck(machineId),
        });
      }, 3000);
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
          queryKey: machineKeys.reviews(machineId),
        }),
        queryClient.invalidateQueries({
          queryKey: machineKeys.reviewCheck(machineId),
        }),
      ]);
    },
  });
};
