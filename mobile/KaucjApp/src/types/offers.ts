export type OfferStatus =
  | "OPEN"
  | "RESERVED"
  | "COMPLETED"
  | "CANCELED"
  | "PENDING_CONFIRMATION"
  | "COMPLAINT";

export interface Offer {
  offerId: number;
  creatorId: number;
  collectorId: number | null;
  status: OfferStatus;
  collectorConfirmed: boolean;
  creatorConfirmed: boolean;
  confirmationDeadline: string | null;
  latitude: number;
  longitude: number;
  pickupAddress: string;
  pickupInstructions: string | null;
  createdAt: string;
  reservedAt: string | null;
  reservedTo: string | null;
  plasticQuantity: number;
  canQuantity: number;
  totalQuantity: number;
  totalPrize: number; //co kurier zapłaci za całość oferty
  totalIncome: number; //co kurier zarobi na ofercie
  plasticPrice: number | null;
  canPrice: number | null;
  updatedAt: string;
}

export interface OfferItemPayload {
  bottleId: 1 | 2; //notnull plastic - 1, can - 2
  quantity: number; //notnull, min 1
  unitPrice: number; //notnull, min 0.0, max 0.5
}

// payload for the POST or PUT
export interface OfferPayload {
  latitude: number; //notnull
  longitude: number; //notnull
  pickupAddress: string; //notnull
  pickupInstructions?: string; //nullable
  items: OfferItemPayload[]; //notnull, min 1, max 2
}

// box parameters for the /api/offer/search endpoint.
export interface OfferSearchBBox {
  swLat: number;
  swLon: number;
  neLat: number;
  neLon: number;
}
