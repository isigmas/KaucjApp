import axios from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.7:8080/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Auth Tokens here
// apiClient.interceptors.request.use(
//   async (config) => {
//     // Example: const token = await secureStore.getItemAsync('token');
//     // if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// global errors, 401 Unauthorized
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Trigger logout flow or token refresh
//     }
//     return Promise.reject(error);
//   },
// );
