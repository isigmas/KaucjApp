export enum OfferStatus {
  OPEN = "OPEN",
  RESERVED = "RESERVED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface Offer {
  offer_id: number;
  creator_id: number;
  collector_id: number;

  status: OfferStatus;
  latitude: number;
  longitude: number;

  pickup_address: string;
  pickup_instructions: string;

  created_at: string;

  plastic_quantity: number;
  can_quantity: number;
  total_quantity: number;

  total_prize: number;

  total_income: number;

  plastic_price: number;
  can_price: number;
}

//the payloads to the backend when creating or updating an offer
export interface OfferItemRequest {
  bottleId: number;
  quantity: number;
  unitPrice: number;
}
export interface OfferRequest {
  latitude: number;
  longitude: number;
  pickupAddress: string;
  pickupInstructions?: string;
  items: OfferItemRequest[];
}
