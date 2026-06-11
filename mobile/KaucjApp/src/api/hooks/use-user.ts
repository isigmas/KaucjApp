import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { User } from "@/src/types/user";
import { UpdateUserFormValues } from "@/src/validation/user";
import { useAuthStore } from "@/src/auth/auth-store";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  byId: (userId: number) => [...userKeys.all, userId] as const,
};

export const useUserDetails = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const { data } = await apiClient.get("/user/me");
      const user = data as User;
      queryClient.setQueryData(userKeys.byId(user.userId), user);
      return user;
    },
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}`);
      return data as User;
    },
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
      queryClient.invalidateQueries({
        queryKey: userKeys.me(),
      });

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
