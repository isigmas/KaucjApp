export type OfferStatus = "OPEN" | "RESERVED" | "COMPLETED" | "CANCELED";

export interface Offer {
  offer_id: number;
  creator_id: number;
  collector_id: number | null;
  status: OfferStatus;
  latitude: number;
  longitude: number;
  pickup_address: string;
  pickup_instructions: string | null;
  created_at: string;
  plastic_quantity: number;
  can_quantity: number;
  total_quantity: number;
  total_prize: number; //co kurier zapłaci za całość oferty
  total_income: number; //co kurier zarobi na ofercie
  plastic_price: number | null;
  can_price: number | null;
}

export interface OfferItemPayload {
  bottleId: number; //notnull
  quantity: number; //notnull, min 1
  unitPrice: number; //notnull, min 0.0, max 0.5
}

// payload for the POST or PUT
export interface OfferPayload {
  latitude: number; //notnull
  longitude: number; //notnull
  pickupAddress: string; //notnull
  pickupInstructions?: string; //nullable
  items: OfferItemPayload[]; //notnull, min 1
}

// box parameters for the /api/offer/search endpoint.
export interface OfferSearchBBox {
  swLat: number;
  swLon: number;
  neLat: number;
  neLon: number;
}
