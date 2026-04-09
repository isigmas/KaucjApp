import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { apiClient } from "../api-client";

export type OfferStatus = "OPEN" | "RESERVED" | "COMPLETED" | "CANCELED";

export interface OfferItemDTO {
  bottle_id: number;
  bottle_name: string;
  quantity: number;
  unit_price: number;
  deposit_fee: number;
}

export interface OfferDTO {
  offer_id: number;
  creator_id: number;
  collector_id: number | null;
  status: OfferStatus;
  latitude: number;
  longitude: number;
  pickup_address: string;
  pickup_instructions: string | null;
  created_at: string;
  items: OfferItemDTO[];
}

export interface RatingRequestDTO {
  score: number;
}

interface ApiErrorDTO {
  error?: string;
  message?: string;
  detail?: string;
  errors?: string[] | Record<string, string | string[]>;
  status?: number;
}

interface CreateOfferItem {
  bottleId: number;
  quantity: number;
  unitPrice: number;
}

interface CreateOfferPayload {
  latitude: number;
  longitude: number;
  pickupAddress: string;
  pickupInstructions: string;
  items: CreateOfferItem[];
}

export const offerKeys = {
  all: () => ["offers"] as const,
  mine: () => ["offers", "my"] as const,
  reserved: () => ["offers", "reserved"] as const,
};

export function getErrorMessage(error: unknown): string {
  const fallback = "Wystąpił błąd. Spróbuj ponownie.";
  if (!error) return fallback;
  const axiosError = error as AxiosError<ApiErrorDTO>;
  const data = axiosError.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }
  if (data?.errors && typeof data.errors === "object") {
    const firstValue = Object.values(data.errors)[0];
    if (Array.isArray(firstValue) && firstValue.length > 0) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return axiosError.message || fallback;
}

export const useGetOffers = () =>
  useQuery({
    queryKey: offerKeys.all(),
    queryFn: async (): Promise<OfferDTO[]> => {
      const { data } = await apiClient.get<OfferDTO[]>("/offer/szosti");
      return data;
    },
  });

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData: CreateOfferPayload) => {
      const { data } = await apiClient.post("/offer/offer", offerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all() });
      queryClient.invalidateQueries({ queryKey: offerKeys.mine() });
    },
  });
};

export const useMyOffers = () =>
  useQuery({
    queryKey: offerKeys.mine(),
    queryFn: async (): Promise<OfferDTO[]> => {
      const { data } = await apiClient.get<OfferDTO[]>("/offer/my");
      return data;
    },
  });

export const useReservedOffers = () =>
  useQuery({
    queryKey: offerKeys.reserved(),
    queryFn: async (): Promise<OfferDTO[]> => {
      const { data } = await apiClient.get<OfferDTO[]>("/offer/my/reserved");
      return data;
    },
  });

export const useCompleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: number) => {
      await apiClient.post(`/offer/${offerId}/status/COMPLETED`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all() });
      queryClient.invalidateQueries({ queryKey: offerKeys.mine() });
      queryClient.invalidateQueries({ queryKey: offerKeys.reserved() });
    },
  });
};

export const useCancelOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: number) => {
      await apiClient.post(`/offer/${offerId}/status/CANCELED`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all() });
      queryClient.invalidateQueries({ queryKey: offerKeys.mine() });
      queryClient.invalidateQueries({ queryKey: offerKeys.reserved() });
    },
  });
};

export const useRateUser = () =>
  useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: number;
      payload: RatingRequestDTO;
    }) => {
      await apiClient.post(`/user/${userId}/rating`, payload);
    },
  });
