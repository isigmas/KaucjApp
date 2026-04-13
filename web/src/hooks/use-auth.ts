"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInAction, signOutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signIn = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await signInAction(credentials);
      if (!res.success) throw new Error(res.error);
      return res.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      router.push("/dashboard");
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await signOutAction();
    },
    onSettled: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    signIn: signIn.mutateAsync,
    signOut: signOut.mutateAsync,
    isSigningIn: signIn.isPending,
    isSigningOut: signOut.isPending,
    error: signIn.error,
  };
};
