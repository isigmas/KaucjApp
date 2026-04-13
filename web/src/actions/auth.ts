"use server";

import { apiClient } from "@/lib/api-client";
import { setTokens, clearTokens } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function signInAction(credentials: any) {
  try {
    // 1. Login to Spring Boot
    const refreshToken = await apiClient<string>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: credentials.email,
        password: credentials.password,
      }),
    });

    // 2. Fetch initial Access Token
    const accessToken = await apiClient<string>("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: refreshToken,
    });

    // 3. Set HttpOnly Cookies
    await setTokens(accessToken, refreshToken);

    // 4. Optionally fetch user profile data here
    const user = { email: credentials.email, role: "ADMIN" }; // Replace with real fetch

    revalidatePath("/", "layout");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOutAction() {
  try {
    await clearTokens();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
