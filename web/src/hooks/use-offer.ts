"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllOffersAction } from "@/actions/offers";
import { Offer } from "@/types";

export const useAllOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      // calls server action bridge to sent a request with an access token
      const res = await getAllOffersAction();

      if (!res.success) {
        throw new Error(res.error || "Failed to fetch offers");
      }

      return res.data as Offer[];
    },

    staleTime: 1000 * 60, // 1 minute
  });
};
