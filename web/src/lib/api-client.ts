import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.7:8080/api";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  // Handle 401 Expiration & Token Refresh Flow
  if (response.status === 401) {
    console.warn(
      `[API] 401 Unauthorized on ${endpoint}. Attempting token refresh...`,
    );

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await clearTokens();
      throw new Error("Session expired. Please log in again.");
    }

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: refreshToken,
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const newAccessToken = await refreshRes.text();

      // Update cookies with the new token
      await setTokens(newAccessToken, refreshToken);

      //retry
      headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    } catch (refreshError) {
      console.error("[API] Refresh failed. Purging session.");
      await clearTokens();
      throw new Error("Authentication failed. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}
