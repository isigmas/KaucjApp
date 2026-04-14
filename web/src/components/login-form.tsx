"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres email." }),
  password: z.string().min(1, { message: "Podaj hasło." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, isSigningIn } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      await signIn(data);
    } catch (error: any) {
      setGlobalError(
        error.message || "Failed to sign in. Please check your credentials.",
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-4xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Administracja Kaucjapp
        </h1>
      </div>

      {/* Global Error Alert */}
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSigningIn}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.email
                  ? "border-red-300 ring-red-100"
                  : "border-gray-300 ring-green-100"
              } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-green-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500`}
              placeholder="aska@kaucjapp.pl"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Haslo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSigningIn}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.password
                  ? "border-red-300 ring-red-100"
                  : "border-gray-300 ring-green-100"
              } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-green-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500`}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSigningIn}
          className="w-full flex cursor-pointer justify-center items-center py-2.5 px-4 border border-transparent rounded-4xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </button>
      </form>
    </div>
  );
}
