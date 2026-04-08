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
      queryClient.invalidateQueries({ queryKey: ["offers", "myOffers"] });
    },
  });
};

export const useMyOffers = () => {
  return useQuery({
    queryKey: ["myOffers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/offer/my");
      console.log("My offers data:", JSON.stringify(data, null, 2));
      const mappedOffers = data.map((rawOffer: any) => ({
        offer_id: rawOffer.offer_id,
        address: rawOffer.pickup_address,
        created_at: rawOffer.created_at,
        items: rawOffer.items, // Assuming OfferItem matches this shape
        latitude: rawOffer.latitude,
        longitude: rawOffer.longitude,
        pickup_info: rawOffer.pickup_instructions || null,
        status: rawOffer.status as "OPEN" | "COMPLETED",
        user: {
          user_id: rawOffer.creator_id,
          // ⚠️ Backend does not provide 'username'. Using a fallback until API is updated.
          username: "Unknown User",
        },
      }));
      return mappedOffers;
    },
  });
};
