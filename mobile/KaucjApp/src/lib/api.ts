import type { Offer } from "@/src/lib/mockData";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "No env";
console.log(`[API] Using base URL: ${API_BASE}`);

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
      fee: i.fee,
    })),
    created_at: raw.created_at,
  }));
}

export interface UserRating {
  user_id: number;
  current_avg: number;
  number_of_feedbacks: number;
}

export async function fetchUserRating(userId: number): Promise<UserRating> {
  const res = await fetch(`${API_BASE}/api/user/${userId}/rating`);

  if (!res.ok) {
    throw new Error(`[fetchUserRating] ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function reserveOffer(
  offerId: number,
  userId: number,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/change-offer-status/${offerId}/${userId}/RESERVED`,
    { method: "POST" },
  );

  if (!res.ok) {
    throw new Error(`[reserveOffer] ${res.status} ${res.statusText}`);
  }
}

export async function fetchReservedOffers(userId: number): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/api/szosti/reserved/${userId}`);

  if (!res.ok) {
    throw new Error(`[fetchReservedOffers] ${res.status} ${res.statusText}`);
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
      fee: i.fee ?? 0,
    })),
    created_at: raw.created_at,
  }));
}

export async function completeOffer(
  offerId: number,
  userId: number,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/change-offer-status/${offerId}/${userId}/COMPLETED`,
    { method: "POST" },
  );

  if (!res.ok) {
    throw new Error(`[completeOffer] ${res.status} ${res.statusText}`);
  }
}

export async function postRating(
  userId: number,
  score: number,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/user/${userId}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });

  if (!res.ok) {
    throw new Error(`[postRating] ${res.status} ${res.statusText}`);
  }
}
