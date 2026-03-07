export interface BottleItem {
  bottle_id: number;
  quantity: number;
  price: number;
}

export interface Offer {
  offer_id: number;
  status: "open" | "reserved" | "completed";
  latitude: number;
  longitude: number;
  address: string;
  pickup_info: string;
  user: { user_id: number; username: string };
  items: BottleItem[];
  created_at: string;
}

export const DEFAULT_REGION = {
  latitude: 50.0647,
  longitude: 19.923,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
} as const;