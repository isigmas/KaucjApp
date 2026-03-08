import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { OfferData } from "../components/offer_creator/create-offer";

interface Offer {
  id: string;
  plasticBottles: number;
}

export const useOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async (): Promise<Offer[]> => {
      const { data } = await apiClient.get("/offers");
      return data;
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOffer: OfferData) => {
      const sellerPrice =
        newOffer.plasticBottles * newOffer.plasticPrice +
        newOffer.glassBottles * newOffer.glassPrice +
        newOffer.cans * newOffer.cansPrice;

      const payload = {
        creatorId: 1,
        latitude: newOffer.latitude || null,
        longitude: newOffer.longitude || null,
        pickupAddress: newOffer.address,
        notes: newOffer.notes,
        plasticBottles: newOffer.plasticBottles,
        glassBottles: newOffer.glassBottles,
        cans: newOffer.cans,
        sellerPrice: sellerPrice,
      };

      console.log("payload: ", JSON.stringify(payload, null, 2));

      const { data } = await apiClient.post("/offers", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
