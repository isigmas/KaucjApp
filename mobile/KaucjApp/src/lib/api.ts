import type { Offer } from "@/src/lib/mockData";

const API_BASE = "http://localhost:8080";

/**
 * Fetches all available offers from the backend.
 * Maps the API response to the local `Offer` schema (lowercase status).
 */
export async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/api/szosti`);

  if (!res.ok) {
    throw new Error(`[fetchOffers] ${res.status} ${res.statusText}`);
  }

  const data: unknown[] = await res.json();

  return data.map((raw: any) => ({
    offer_id: raw.offer_id,
    status: (raw.status as string).toLowerCase() as Offer["status"],
    latitude: raw.latitude,
    longitude: raw.longitude,
    address: raw.address,
    pickup_info: raw.pickup_info,
    user: {
      user_id: raw.user.user_id,
      username: raw.user.username,
    },
    items: raw.items.map((i: any) => ({
      bottle_id: i.bottle_id,
      quantity: i.quantity,
      price: i.price,
    })),
    created_at: raw.created_at,
  }));
}
