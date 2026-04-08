import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

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

// ==========================================
// 1. REQUEST INTERCEPTOR (Logs Outgoing)
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Grouping the logs keeps the console clean. You click to expand it.
    console.groupCollapsed(
      `🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`,
    );
    console.log("Full URL:", `${config.baseURL}${config.url}`);
    console.log("Headers:", config.headers);
    if (config.data) console.log("Payload:", config.data);
    if (config.params) console.log("Params:", config.params);
    console.groupEnd();

    return config; // You must return the config to let the request proceed
  },
  (error) => {
    console.error("🚨 [Request Error] Failed to send request:", error);
    return Promise.reject(error);
  },
);

// ==========================================
// 2. RESPONSE INTERCEPTOR (Logs Incoming)
// ==========================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses (2xx status codes)
    console.groupCollapsed(
      `✅ [Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.groupEnd();

    return response; // Return the response to pass it down to React Query
  },
  (error: AxiosError) => {
    // Log failed responses (4xx, 5xx, or network errors)
    console.groupCollapsed(
      `❌ [Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
    );
    console.error("Status:", error.response?.status || "Network/Timeout");
    console.error("Error Message:", error.message);
    if (error.response?.data) {
      console.error("Backend Error Data:", error.response.data);
    }
    console.groupEnd();

    // -- Your Global Error Handling Logic Goes Here --
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.error("Global Catch: Network or Timeout issue.");
    }
    if (error.response?.status === 401) {
      console.error("Global Catch: Unauthorized (e.g., Token expired).");
    }

    return Promise.reject(error); // Reject so React Query's `onError` fires
  },
);

import { tokenStorage } from "../auth/secure-storage";
import { useAuthStore } from "../auth/auth-store";

// Injecting the Access Token
// apiClient.interceptors.request.use(async (config) => {
//   // directly from Zustand's memory for  speed
//   const token = useAuthStore.getState().accessToken;
//   console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//     console.debug(`[Auth] Injected Access Token into request header.`);
//   } else {
//     console.debug(`[Auth] No Access Token found in memory for this request.`);
//   }
//   return config;
// });

// // Handle 401 Expiration & Queue
// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (value?: unknown) => void;
//   reject: (reason?: any) => void;
// }> = [];

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

//token refresh logic - if we get 401, we try to refresh the token and repeat the original request
// apiClient.interceptors.response.use(
//   (response) => response, //200
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response) {
//       // The server answered  with an error code
//       console.error(
//         `[API Error] ${error.response.status} - ${originalRequest?.url}`,
//       );
//     } else if (error.request) {
//       // The request was sent , no response was received
//       console.error(
//         `[API Error] Network/Timeout - ${error.message} - ${originalRequest?.url}`,
//       );
//       throw new Error(
//         "Network error or server is unreachable. Please check your connection.",
//       );
//     } else {
//       // Something broke before the request could even be sent
//       console.error(`[API Error] Client Setup Error - ${error.message}`);
//     }

//     // If 401 and we haven't already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.warn(
//         `[Auth] 401 Unauthorized detected for ${originalRequest.url}. Triggering recovery flow.`,
//       );
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return apiClient(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshToken = await tokenStorage.getRefreshToken();
//         if (!refreshToken) throw new Error("No refresh token");

//         console.log(
//           `[Auth Refresh] Attempting to swap Refresh Token for new Access Token...`,
//         );
//         const { data } = await axios.post(`${API_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         const newAccessToken = data.accessToken;
//         const newRefreshToken = data.refreshToken || refreshToken;

//         console.log(
//           `[Auth Refresh] Token swap successful! Updating storage and memory.`,
//         );
//         // Update tokens in cache and memory
//         await useAuthStore
//           .getState()
//           .updateTokens(newAccessToken, newRefreshToken);

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         processQueue(null, newAccessToken);

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         await useAuthStore.getState().purgeAuth(); // Kick user out
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );
