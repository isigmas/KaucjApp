import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../api-client";
import {
  Offer,
  OfferPayload,
  OfferStatus,
  OfferSearchBBox,
  ApiErrorResponse,
} from "@/src/types";
import { router } from "expo-router";

export const offerKeys = {
  all: () => ["offers"] as const,
  lists: () => [...offerKeys.all(), "list"] as const,
  details: () => [...offerKeys.all(), "detail"] as const,
  detail: (id: number) => [...offerKeys.details(), id] as const,
  mine: () => [...offerKeys.all(), "my"] as const,
  reserved: () => [...offerKeys.all(), "my-reserved"] as const,
  search: (bbox: OfferSearchBBox) =>
    [...offerKeys.all(), "search", bbox] as const,
};

// GET /offer/szosti - get all offers (for map)
export const useAllOffers = () => {
  return useQuery<Offer[], AxiosError<ApiErrorResponse>>({
    queryKey: offerKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer[]>("/offer/szosti");
      return data;
    },
  });
};

// GET /offer/my - get offers created by the current user
export const useMyOffers = () => {
  return useQuery<Offer[], AxiosError<ApiErrorResponse>>({
    queryKey: offerKeys.mine(),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer[]>("/offer/my");
      return data;
    },
  });
};

// GET /offer/my/reserved - get offers reserved by the current user
export const useMyReservedOffers = () => {
  return useQuery<Offer[], AxiosError<ApiErrorResponse>>({
    queryKey: offerKeys.reserved(),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer[]>("/offer/my/reserved");
      return data;
    },
  });
};

// GET /offer/search - search offers within a box
export const useSearchOffers = (
  bbox: OfferSearchBBox,
  enabled: boolean = true,
) => {
  return useQuery<Offer[], AxiosError<ApiErrorResponse>>({
    queryKey: offerKeys.search(bbox),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer[]>("/offer/search", {
        params: bbox,
      });
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// --- mutations ---

// POST /offer/offer - create a new offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation<number, AxiosError<ApiErrorResponse>, OfferPayload>({
    mutationFn: async (offerData) => {
      const { data } = await apiClient.post<number>("/offer/offer", offerData);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all() });
    },
  });
};

// PUT /offer/{id} - update an existing offer
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    { id: number; payload: OfferPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      await apiClient.patch(`/offer/${id}`, payload);
    },
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all() });
    },
  });
};

// DELETE /offer/{id} - delete an offer
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/offer/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all() });
    },
  });
};

// POST /offer/{id}/status/{newStatus}
export const useChangeOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    { offerId: number; newStatus: OfferStatus }
  >({
    mutationFn: async ({ offerId, newStatus }) => {
      await apiClient.post(`/offer/${offerId}/status/${newStatus}`);
    },
    onSuccess: async (_, { offerId }) => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all() });
    },
  });
};

// POST /offer/{id}/status/RESERVED - reserve an offer
export const useReserveOffer = (offerId: number, totalIncome: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>>({
    mutationFn: () => apiClient.post(`/offer/${offerId}/status/RESERVED`),
    onSuccess: () => {
      router.push({
        pathname: "/(app)/success-screen",
        params: { totalIncome },
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.all() });
    },
  });
};
