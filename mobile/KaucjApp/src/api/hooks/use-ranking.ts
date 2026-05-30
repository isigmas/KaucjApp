import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { UserStats, RankingQueryParams } from "@/src/types/ranking";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/src/types";

export const rankingKeys = {
  all: () => ["ranking"] as const,
  lists: () => [...rankingKeys.all(), "list"] as const,
  list: (params: RankingQueryParams) =>
    [...rankingKeys.lists(), params] as const,
};

export const useRanking = (params: RankingQueryParams = {}) => {
  return useQuery<UserStats[], AxiosError<ApiErrorResponse>>({
    queryKey: rankingKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<UserStats[]>("/user/ranking", {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// used for infinite scrolling
export const useInfiniteRanking = (
  params: Omit<RankingQueryParams, "page"> = {},
) => {
  const size = params.size || 10;

  return useInfiniteQuery({
    queryKey: rankingKeys.list(params),
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await apiClient.get<UserStats[]>("/user/ranking", {
        params: { ...params, page: pageParam },
      });
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < size) {
        return undefined;
      }
      return allPages.length;
    },
  });
};
