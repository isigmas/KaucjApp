import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

  const method = options.method || "GET";

  // ---- REQUEST LOGGING ----
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[API REQUEST] ${method} ${endpoint}`);
    console.log(
      `Token:`,
      accessToken ? `Bearer ${accessToken.substring(0, 25)}...` : "None",
    );

    if (options.body) {
      try {
        const parsedBody = JSON.parse(options.body as string);
        console.log(`Body:`, JSON.stringify(parsedBody, null, 2));
      } catch {
        console.log(`Body:`, options.body);
      }
    }
  }

  let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  // ---- Handle 401 Expiration & Token Refresh Flow ----
  if (response.status === 401) {
    console.warn(
      `⚠️ [API] 401 Unauthorized on ${endpoint}. Attempting token refresh...`,
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

      headers["Authorization"] = `Bearer ${newAccessToken}`;

      if (process.env.NODE_ENV !== "production") {
        console.log(`🔄 [API RETRY] ${method} ${endpoint} (with new token)`);
      }

      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    } catch (refreshError) {
      console.error("[API] Refresh failed. Purging session.");
      await clearTokens();
      throw new Error("Authentication failed. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (process.env.NODE_ENV !== "production") {
      console.error(`❌ [API ERROR] ${response.status} ${endpoint}`, errorData);
    }
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }

  // ---- RESPONSE LOGGING ----
  const text = await response.text();
  let responseData: any;
  // response  is either JSON or plan text
  try {
    responseData = text ? JSON.parse(text) : ({} as T);
  } catch (e) {
    responseData = text as unknown as T;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`[API RESPONSE] ${response.status} ${endpoint}`);
    console.log(
      `Data:`,
      typeof responseData === "object"
        ? JSON.stringify(responseData, null, 2)
        : responseData,
    );
  }

  return responseData;
}
