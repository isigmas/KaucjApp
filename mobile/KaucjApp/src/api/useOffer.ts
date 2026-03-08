import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { OfferData } from "../components/offer_creator/create-offer";

interface OfferItem {
  bottle_id: number;
  fee: number;
  price: number;
  quantity: number;
}

export interface Offer {
  offer_id: number;
  address: string;
  created_at: string;
  items: OfferItem[];
  latitude: number;
  longitude: number;
  pickup_info: string | null;
  status: "OPEN" | "COMPLETED"; // Assuming COMPLETED is the finished state
  user: {
    user_id: number;
    username: string;
  };
}

export const useOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async (): Promise<Offer[]> => {
      const { data } = await apiClient.get("/api/offers");
      return data;
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOffer: OfferData) => {
      const payload = {
        creatorId: 1,
        latitude: newOffer.latitude || null,
        longitude: newOffer.longitude || null,
        aQuantity: newOffer.plasticBottles,
        aPrice: 0.5,
        aFee: newOffer.plasticPrice,
        bQuantity: newOffer.glassBottles,
        bPrice: 1,
        bFee: newOffer.glassPrice,
        cQuantity: newOffer.cans,
        cPrice: 0.5,
        cFee: newOffer.cansPrice,
        pickupAddress: newOffer.address,
        pickupInstructions: newOffer.notes,
      };

      console.log("payload: ", JSON.stringify(payload, null, 2));

      const { data } = await apiClient.post("/api/offer", payload);

      console.log("response: ", JSON.stringify(data, null, 2));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};

export const useOffersByID = (id: string) => {
  return useQuery({
    queryKey: ["offers", id],
    queryFn: async (): Promise<Offer[]> => {
      const { data } = await apiClient.get(`/api/szosti/${id}`);

      const mappedData = data.map((offer: any) => ({
        address: offer.address,
        created_at: offer.created_at,
        items: offer.items.map((item: any) => ({ ...item })),
        latitude: offer.latitude,
        longitude: offer.longitude,
        offer_id: offer.offer_id,
        pickup_info: offer.pickup_info,
        status: offer.status,
        user: offer.user,
      }));

      console.log("Mapped data: ", JSON.stringify(mappedData, null, 2));

      return data;
    },
    enabled: !!id,
  });
};

export const useCompleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      offerId,
      idUser,
    }: {
      offerId: number;
      idUser: string;
    }) => {
      await apiClient.post(
        `/api/change-offer-status/${offerId}/${idUser}/completed`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
