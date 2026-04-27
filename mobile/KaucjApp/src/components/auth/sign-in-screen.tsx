import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

import { signInSchema, SignInValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";

import { AuthHeader } from "@/src/components/auth/auth-header";
import { AuthFormWrapper } from "@/src/components/auth/auth-form-wrapper";
import { AuthFooter } from "@/src/components/auth/auth-footer";
import { ErrorBanner } from "@/src/components/auth/error-banner";
import { TestFooter } from "@/src/components/auth/onboarding-tester";
import { SignInForm } from "@/src/components/auth/sign-in-form";

export default function SignInScreen() {
  const { signIn, isSigningIn, signInError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SignInValues) => {
    Keyboard.dismiss();
    signIn(data);
  };

  return (
    <AuthFormWrapper>
      <AuthHeader
        title="Siema!"
        subtitle="Zaloguj się, aby korzystać z aplikacji"
      />

      {signInError && (
        <ErrorBanner
          message={signInError.userMessage}
          isNetworkError={signInError.isNetworkError}
        />
      )}

      <SignInForm
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isSigningIn}
      />

      <AuthFooter
        prompt="Nie masz konta? "
        actionLabel="Zarejestruj się"
        onPress={() => router.push("/sign-up")}
      />

      {/* jezeli chcecie resetowac onboarding zeby sie znow pojawil to trzeba odkomentowac linijke nizej i na ekranie logowania pojawi sie przycisk do resetowania onboardingu  */}

      {/* <TestFooter /> */}
    </AuthFormWrapper>
  );
}
