import { Keyboard, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

import { spacing } from "@/src/theme";
import { signUpSchema, SignUpValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";

import { AuthHeader } from "@/src/components/auth/auth-header";
import { AuthFormWrapper } from "@/src/components/auth/auth-form-wrapper";
import { AuthFooter } from "@/src/components/auth/auth-footer";
import { ErrorBanner } from "@/src/components/auth/error-banner";
import { SignUpForm } from "@/src/components/auth/sign-up-form";

export default function SignUpScreen() {
  const { signUp, isSigningUp, signUpError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpValues) => {
    Keyboard.dismiss();
    signUp(data);
  };

  return (
    <AuthFormWrapper contentStyle={styles.content}>
      <AuthHeader
        title="Stwórz konto"
        subtitle="Zarejestruj się i bądź częścią społeczności!"
      />

      {signUpError && (
        <ErrorBanner
          message={signUpError.userMessage}
          isNetworkError={signUpError.isNetworkError}
        />
      )}

      <SignUpForm
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isSigningUp}
      />

      <AuthFooter
        prompt="Masz już konto? "
        actionLabel="Zaloguj się"
        onPress={() => router.push("/(auth)")}
      />
    </AuthFormWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 40,
  },
});
