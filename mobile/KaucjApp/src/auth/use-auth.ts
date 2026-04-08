import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth-store";
import { apiClient } from "@/src/api/api-client";
import { SignInValues, SignUpValues } from "@/src/types";

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
      const { data } = await apiClient.post("/auth/register", credentials);
      return data;
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.accessToken, data.refreshToken);
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
