import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { User } from "@/src/types/user";

export const useUserDetails = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const { data } = await apiClient.get("/user/me");
      console.log("Fetched user details:", JSON.stringify(data, null, 2));
      return data as User;
    },
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}`);
      return data as User;
    },
  });
};
