import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth-store";
import { apiClient } from "@/src/api/api-client";
import { SignInValues, SignUpValues } from "@/src/types";
import { da } from "zod/v4/locales";
import { AxiosError } from "axios";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const purgeAuth = useAuthStore((state) => state.purgeAuth);

  const queryClient = useQueryClient();

  const signIn = useMutation({
    mutationFn: async (credentials: SignInValues) => {
      const { data } = await apiClient.post("/auth/login", credentials);
      return data; // { user, accessToken, refreshToken }
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const signUp = useMutation({
    mutationFn: async (credentials: SignUpValues) => {
      const body = {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        username: credentials.userName,
        phone: credentials.phoneNumber,
        email: credentials.email,
        password: credentials.password,
      };

      console.log("Signing up with:", JSON.stringify(body, null, 2));

      const res = await apiClient.post("/auth/register", body);
      return res.data;
    },

    onSuccess: async (data) => {
      // Handle successful sign up (e.g., save tokens, redirect)
      // await setAuth(data.user, data.accessToken, data.refreshToken);
      console.log("Sign-up successful:", data);
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      // 1. Extract the specific error message sent by your backend
      const backendMessage = error.response?.data?.message;

      // 2. Provide a fallback message just in case
      const fallbackMessage = "An unexpected error occurred during sign up.";

      // 3. Determine the final message to show the user
      const errorMessage = backendMessage || fallbackMessage;

      // 4. Log for debugging and show to the user
      console.error("Sign-up failed:", errorMessage);
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: async () => {
      // Force cleanup locally regardless of backend success/failure
      await purgeAuth();
      queryClient.clear();
    },
  });

  return {
    // Session State
    user,
    session: accessToken ? { accessToken } : null,
    isAuthenticated: !!user && !!accessToken,

    //expose mutateAsync to await them in form  submission
    signIn: signIn.mutateAsync,
    signUp: signUp.mutateAsync,
    signOut: signOut.mutateAsync,

    isSigningIn: signIn.isPending,
    isSigningUp: signUp.isPending,
    isSigningOut: signOut.isPending,

    signInError: signIn.error,
    signUpError: signUp.error,
  };
};
