import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { apiClient } from "../api-client";

import { RankingQueryParams, UserStats } from "@/src/types/ranking";

export const rankingKeys = {
  all: ["ranking"] as const,
  lists: () => [...rankingKeys.all, "list"] as const,
  list: (params: RankingQueryParams) =>
    [...rankingKeys.lists(), params] as const,
  infinite: (params: Omit<RankingQueryParams, "page">) =>
    [...rankingKeys.all, "infinite", params] as const,
};

const fetchRanking = async (params: RankingQueryParams) => {
  const { data } = await apiClient.get<UserStats[]>("/user/ranking", {
    params,
  });
  return data;
};

export const useRanking = (params: RankingQueryParams = {}) => {
  return useQuery({
    queryKey: rankingKeys.list(params),
    queryFn: () => fetchRanking(params),
    placeholderData: keepPreviousData,
  });
};

// used for infinite scrolling
export const useInfiniteRanking = (
  params: Omit<RankingQueryParams, "page"> = {},
) => {
  const size = params.size || 10;

  return useInfiniteQuery({
    queryKey: rankingKeys.infinite(params),
    queryFn: ({ pageParam }) => fetchRanking({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < size) {
        return undefined;
      }
      return allPages.length;
    },
  });
};
