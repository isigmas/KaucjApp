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
      console.log("payload: ", newOffer);
      const { data } = await apiClient.post("/offers", newOffer);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
};
