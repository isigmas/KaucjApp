import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { User } from "@/src/types/user";
import { UpdateUserFormValues } from "@/src/validation/user";
import { useAuthStore } from "@/src/auth/auth-store";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  byId: (userId: number) => [...userKeys.details(), userId] as const,
  rating: (userId: number) => [...userKeys.all, "rating", userId] as const,
  reviews: (userId: number) => [...userKeys.all, "reviews", userId] as const,
  reviewChecks: (userId: number) =>
    [...userKeys.all, "review-check", userId] as const,
  reviewCheck: (userId: number, offerId: number) =>
    [...userKeys.reviewChecks(userId), offerId] as const,
};

export const useUserDetails = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const { data } = await apiClient.get<User>("/user/me");
      queryClient.setQueryData(userKeys.byId(data.userId), data);
      return data;
    },
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(`/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserFormValues) => {
      await apiClient.patch("/user/me", payload);
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      const updates: Partial<User> = {};
      if (payload.firstName !== undefined) {
        updates.firstName = payload.firstName ?? "";
      }
      if (payload.lastName !== undefined) {
        updates.lastName = payload.lastName ?? "";
      }

      useAuthStore.getState().patchUser(updates);
    },
  });
};
