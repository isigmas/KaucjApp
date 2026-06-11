import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { User } from "@/src/types/user";
import { UpdateUserFormValues } from "@/src/validation/user";

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userDetails"],
      });
    },
  });
};
