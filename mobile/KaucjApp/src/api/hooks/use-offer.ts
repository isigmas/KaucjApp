import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";

interface Offer {
  latitude: number;
  longitude: number;
  pickupAddress: string;
  pickupInstructions: string;
  items: Item[];
}
interface Item {
  bottleId: number;
  quantity: number;
  unitPrice: number;
}

export const useGetOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/offer/test");
      return data;
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData: Offer) => {
      console.log(
        "Creating offer with data:",
        JSON.stringify(offerData, null, 2),
      );
      const { data } = await apiClient.post("/offer/offer", offerData);

      console.log("Offer creation data:", JSON.stringify(data, null, 2));
      return data;
    },
    onSuccess: () => {
      console.log("Offer created successfully, invalidating offers query.");
    },
  });
};
