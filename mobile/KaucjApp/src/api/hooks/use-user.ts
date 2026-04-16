import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";

export const useUserDetails = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const { data } = await apiClient.get("/user/me");
      console.log("Fetched user details:", JSON.stringify(data, null, 2));
      return data;
    },
  });
};
