import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthStore, User } from "./auth-store";
import { apiClient } from "@/src/api/api-client";
import { SignInValues, SignUpValues } from "@/src/types";
import { tokenStorage } from "./secure-storage";
import { AuthError, parseAuthError } from "@/src/api/api-error";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const purgeAuth = useAuthStore((state) => state.purgeAuth);

  const queryClient = useQueryClient();

  const signIn = useMutation<
    { accessToken: string; refreshToken: string; user: User },
    AuthError,
    SignInValues
  >({
    mutationFn: async (credentials) => {
      try {
        const loginRes = await apiClient.post("/auth/login", {
          identifier: credentials.email,
          password: credentials.password,
        });
        const refreshToken: string = loginRes.data;

        const refreshRes = await apiClient.post("/auth/refresh", refreshToken, {
          headers: { "Content-Type": "text/plain" },
        });
        const newAccessToken: string = refreshRes.data;

        // TODO: replace with a real /auth/me call once the endpoint exists
        const user: User = { id: "1", email: credentials.email, name: "Aska" };

        return { accessToken: newAccessToken, refreshToken, user };
      } catch (error) {
        throw parseAuthError(error);
      }
    },

    onSuccess: async ({ user, accessToken, refreshToken }) => {
      await setAuth(user, accessToken, refreshToken);
      router.replace("/(app)/(tabs)/home");
    },
  });

  const signUp = useMutation<void, AuthError, SignUpValues>({
    mutationFn: async (credentials) => {
      try {
        await apiClient.post("/auth/register", {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          username: credentials.userName,
          phone: credentials.phoneNumber,
          email: credentials.email,
          password: credentials.password,
        });
      } catch (error) {
        throw parseAuthError(error);
      }
    },

    onSuccess: (_, variables) => {
      router.push({
        pathname: "/(auth)/email-sent",
        params: { email: variables.email },
      });
    },
  });

  const signOut = useMutation<void, AuthError, void>({
    mutationFn: async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        await apiClient.post("/auth/logout", refreshToken, {
          headers: { "Content-Type": "text/plain" },
        });
      } catch (error) {
        console.warn("[signOut] Backend logout failed.", error);
      }
    },

    onSettled: async () => {
      await purgeAuth();
      queryClient.clear();
    },
  });

  const resetPassword = useMutation<void, AuthError, string>({
    mutationFn: async (email) => {
      try {
        await apiClient.post("/auth/resetpassword", email, {
          headers: { "Content-Type": "text/plain" },
        });
      } catch (error) {
        throw parseAuthError(error);
      }
    },

    onSuccess: (_, email) => {
      router.push({
        pathname: "/(auth)/email-sent",
        params: { email: email, type: "resetPassword" },
      });
    },
  });

  return {
    user,
    session: accessToken ? { accessToken } : null,
    isAuthenticated: !!user && !!accessToken,

    // Actions — expose mutate so screens need no try/catch
    signIn: signIn.mutate,
    signUp: signUp.mutate,
    signOut: signOut.mutate,
    resetPassword: resetPassword.mutate,

    isSigningIn: signIn.isPending,
    isSigningUp: signUp.isPending,
    isSigningOut: signOut.isPending,
    isPasswordResetting: resetPassword.isPending,

    // AuthError | null
    signInError: signIn.error,
    signUpError: signUp.error,
    resetPasswordError: resetPassword.error,
  };
};
