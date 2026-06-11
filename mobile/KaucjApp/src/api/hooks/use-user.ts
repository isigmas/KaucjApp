import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { User } from "@/src/types/user";
import { UpdateUserFormValues } from "@/src/validation/user";
import { useAuthStore } from "@/src/auth/auth-store";

export const useUserDetails = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const { data } = await apiClient.get("/user/me");
      return data as User;
    },
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}`);
      console.log("data", JSON.stringify(data, null, 2));
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
        queryKey: ["userDetails"],
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
