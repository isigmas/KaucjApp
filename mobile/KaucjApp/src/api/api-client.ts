import axios, { AxiosError } from "axios";
import { tokenStorage } from "../auth/secure-storage";
import { useAuthStore } from "../auth/auth-store";
import { camelizeKeys, decamelizeKeys } from "humps";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Injecting the Access Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.debug(`[Auth] Current Access Token: ${token}`);
  } else {
    console.debug(`[Auth] No Access Token found in memory for this request.`);
  }

  if (config.data && typeof config.data === "object") {
    config.data = decamelizeKeys(config.data);
  }

  //logging
  console.log(
    `[API Request]  ►  ${config.method?.toUpperCase()} ${config.url}`,
  );
  if (config.data) {
    console.log(
      `[API Request] Payload: ${JSON.stringify(config.data, null, 2)}`,
    );
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
  (response) => {
    console.log(
      `[API] ◄ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    if (response.data && typeof response.data === "object") {
      response.data = camelizeKeys(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    console.debug(`[API Error] ${JSON.stringify(error, null, 2)}`);

    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.error(`[API Error] Global Network or Timeout issue`);
      return Promise.reject(error);
    }

    if (error.response) {
      console.warn(
        `[API Error]${error.response.status} - ${error.response.config.method?.toUpperCase()} ${originalRequest?.url} - ${JSON.stringify(error.response.data, null, 2)}`,
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
