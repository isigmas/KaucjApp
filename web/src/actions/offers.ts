"use server";

import { apiClient } from "@/lib/api-client";
import { Offer } from "@/types";

export async function getAllOffersAction() {
  try {
    const offers = await apiClient<Offer[]>("/offer/szosti");
    return { success: true, data: offers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
