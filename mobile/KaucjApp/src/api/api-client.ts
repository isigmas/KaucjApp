import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "../auth/secure-storage";
import { useAuthStore } from "../auth/auth-store";

const API_URL = "http://192.168.100.7:8080/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if the error is a timeout or network error
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.error("Global API Error: Network or Timeout issue.");
      // You could trigger a global toast notification here
    }

    // Check for global authentication errors (e.g., token expired)
    if (error.response?.status === 401) {
      console.error("Unauthorized: Redirecting to login...");
      // Handle global logout logic here
    }

    // Reject the promise so React Query's onError gets triggered
    return Promise.reject(error);
  },
);

//Injecting the Access Token
apiClient.interceptors.request.use(async (config) => {
  // directly from Zustand's memory for  speed
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

//token refresh logic - if we get 401, we try to refresh the token and repeat the original request
apiClient.interceptors.response.use(
  (response) => response, //200
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // The server answered  with an error code
      console.error(
        `[API Error] ${error.response.status} - ${originalRequest?.url}`,
      );
    } else if (error.request) {
      // The request was sent , no response was received
      console.error(
        `[API Error] Network/Timeout - ${error.message} - ${originalRequest?.url}`,
      );
      throw new Error(
        "Network error or server is unreachable. Please check your connection.",
      );
    } else {
      // Something broke before the request could even be sent
      console.error(`[API Error] Client Setup Error - ${error.message}`);
    }

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(
        `[Auth] 401 Unauthorized detected for ${originalRequest.url}. Triggering recovery flow.`,
      );
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
        if (!refreshToken) throw new Error("No refresh token");

        console.log(
          `[Auth Refresh] Attempting to swap Refresh Token for new Access Token...`,
        );
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken || refreshToken;

        console.log(
          `[Auth Refresh] Token swap successful! Updating storage and memory.`,
        );
        // Update tokens in cache and memory
        await useAuthStore
          .getState()
          .updateTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await useAuthStore.getState().purgeAuth(); // Kick user out
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
