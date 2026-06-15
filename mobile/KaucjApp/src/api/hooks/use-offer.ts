import {
  Complaint,
  ComplaintPayload,
  Offer,
  OfferPayload,
  OfferSearchBBox,
  OfferStatus,
} from "@/src/types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { router } from "expo-router";
import { apiClient } from "../api-client";

export const offerKeys = {
  all: ["offers"] as const,
  searches: () => [...offerKeys.all, "search"] as const,
  search: (bbox: OfferSearchBBox) => [...offerKeys.searches(), bbox] as const,
  details: () => [...offerKeys.all, "detail"] as const,
  detail: (id: number) => [...offerKeys.details(), id] as const,
  mine: () => [...offerKeys.all, "my"] as const,
  history: () => [...offerKeys.all, "history"] as const,
  reserved: () => [...offerKeys.all, "my-reserved"] as const,
  reservedHistory: () => [...offerKeys.all, "reserved-history"] as const,
  complaints: (offerId: number) =>
    [...offerKeys.all, "complaints", offerId] as const,
};

/**
 * Shared fetcher for every offer list endpoint: sorts newest-first and seeds
 * each offer into the detail cache so detail screens open instantly.
 */
const fetchOfferList = async (
  queryClient: QueryClient,
  url: string,
  params?: Record<string, unknown>,
): Promise<Offer[]> => {
  const { data } = await apiClient.get<Offer[]>(url, { params });

  // Sort by updatedAt newest-first
  const sorted = [...data].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  // cache seeding
  sorted.forEach((offer) => {
    queryClient.setQueryData(offerKeys.detail(offer.offerId), offer);
  });

  return sorted;
};

// GET /offer/{id} - get an offer by id
export const useGetOffer = (id: number) => {
  return useQuery({
    queryKey: offerKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer>(`/offer/${id}`);
      return data;
    },
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

// GET /offer/my - get offers created by the current user
export const useMyOffers = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: offerKeys.mine(),
    queryFn: () => fetchOfferList(queryClient, "/offer/my"),
  });
};

// GET /offer/my/history - get offers history for the current user
export const useMyOffersHistory = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: offerKeys.history(),
    queryFn: () => fetchOfferList(queryClient, "/offer/my/history"),
  });
};

// GET /offer/my/reserved - get offers reserved by the current user
export const useMyReservedOffers = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: offerKeys.reserved(),
    queryFn: () => fetchOfferList(queryClient, "/offer/my/reserved"),
  });
};

// GET /offer/my/reserved/history - get reserved offers history for the current user
export const useMyReservedOffersHistory = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: offerKeys.reservedHistory(),
    queryFn: () => fetchOfferList(queryClient, "/offer/my/reserved/history"),
  });
};

// GET /offer/search - search offers within a box
export const useSearchOffers = (
  bbox: OfferSearchBBox,
  enabled: boolean = true,
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: offerKeys.search(bbox),
    queryFn: async () => {
      const { data } = await apiClient.get<Offer[]>("/offer/search", {
        params: bbox,
      });
      // cache seeding
      data.forEach((offer) => {
        queryClient.setQueryData(offerKeys.detail(offer.offerId), offer);
      });
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    gcTime: 1000 * 60 * 30,
  });
};

// --- mutations ---

// POST /offer/offer - create a new offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData: OfferPayload) => {
      const { data } = await apiClient.post<number>("/offer/offer", offerData);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

// PATCH /offer/{id} - update an existing offer
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: OfferPayload;
    }) => {
      await apiClient.patch(`/offer/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

// DELETE /offer/{id} - delete an offer
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/offer/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

// POST /offer/{id}/status/{newStatus}
export const useChangeOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      newStatus,
    }: {
      offerId: number;
      newStatus: OfferStatus;
    }) => {
      await apiClient.post(`/offer/${offerId}/status/${newStatus}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

// POST /offer/{id}/status/RESERVED - reserve an offer
export const useReserveOffer = (offerId: number, totalIncome: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/offer/${offerId}/status/RESERVED`);
    },
    onSuccess: () => {
      router.push({
        pathname: "/(app)/(tabs)/home/success-screen",
        params: { totalIncome },
      });
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

// POST /offer/confirm/{offerId} - confirm an offer
export const useConfirmOffer = (offerId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/offer/confirm/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

//-------------------------------- COMPLAINTS --------------------------------
// GET /offer/{offerId}/complaints - get complaints for an offer
export const useGetOfferComplaints = (offerId: number) => {
  return useQuery({
    queryKey: offerKeys.complaints(offerId),
    queryFn: async () => {
      const { data } = await apiClient.get<Complaint[]>(
        `/offer/${offerId}/complaints`,
      );
      return data;
    },
    enabled: !!offerId,
  });
};

// POST /offer/complaint/{id} - complaint an offer
export const useComplaintOffer = (offerId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintData: ComplaintPayload) => {
      await apiClient.post(`/offer/complaint/${offerId}`, complaintData);
    },
    onSuccess: () => {
      // offerKeys.all also covers offerKeys.complaints(offerId)
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};
