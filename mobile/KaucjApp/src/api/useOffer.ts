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
