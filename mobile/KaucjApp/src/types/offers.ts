export enum OfferStatus {
  OPEN = "OPEN",
  RESERVED = "RESERVED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface OfferItemResponse {
  bottle_id: number;
  bottle_name: string;
  quantity: number;
  unit_price: number;
  deposit_fee: number;
}

export interface Offer {
  offer_id: number;
  creator_id: number;
  collector_id: number | null;
  status: OfferStatus;
  latitude: number;
  longitude: number;
  pickup_address: string;
  pickup_instructions?: string | null;
  created_at: string;
  items: OfferItemResponse[];
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
