export interface Offer {
  status: string;
  latitude: number;
  longitude: number;
  offer_id: number;
  creator_id: number;
  collector_id: number;
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
