import axios, { AxiosError } from "axios";
import { tokenStorage } from "../auth/secure-storage";
import { useAuthStore } from "../auth/auth-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Injecting the Access Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug(`[Auth] Injected Access Token into request header.`);
    console.debug(`[Auth] Current Access Token: ${token}`);
  } else {
    console.debug(`[Auth] No Access Token found in memory for this request.`);
  }
  return config;
});

// Handle 401 Expiration & Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response, // 200 OK
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.error("[API Error] Global Network or Timeout issue.");
      return Promise.reject(error);
    }

    if (error.response) {
      console.warn(
        `[API Error] ${error.response.status} - ${originalRequest?.url} - ${JSON.stringify(error.response.data, null, 2)}`,
      );
    } else {
      console.error(`[API Error] Client Setup Error - ${error.message}`);
    }

    // Handle 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(
        `[Auth] 401 Unauthorized detected for ${originalRequest.url}. Triggering refresh flow.`,
      );

      // If already refreshing, queue this request until the refresh is done
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken)
          throw new Error("No refresh token available in storage.");

        console.log(
          `[Auth Refresh] Attempting to swap Refresh Token for new Access Token...`,
        );

        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          refreshToken,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          },
        );

        const newAccessToken = data;

        console.log(
          `[Auth Refresh] Token swap successful! Updating storage and memory.`,
        );

        // Update tokens in cache and memory
        await useAuthStore
          .getState()
          .updateTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(
          "[Auth Refresh] Refresh failed. Purging auth state and redirecting to login.",
        );
        processQueue(refreshError, null);
        await useAuthStore.getState().purgeAuth(); // Kick user out to trigger RootLayout redirect
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 4. Reject any other errors so React Query's onError gets triggered
    return Promise.reject(error);
  },
);
