import { Keyboard, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

import { spacing } from "@/src/theme";
import { useAuth } from "@/src/auth/use-auth";

import { AuthHeader } from "@/src/components/auth/auth-header";
import { AuthFormWrapper } from "@/src/components/auth/auth-form-wrapper";
import { AuthFooter } from "@/src/components/auth/auth-footer";
import { ErrorBanner } from "@/src/components/auth/error-banner";
import { SignUpForm } from "@/src/components/auth/sign-up-form";
import { signUpSchema, SignUpValues } from "@/src/validation";

export default function SignUpScreen() {
  const { signUp, isSigningUp, signUpError } = useAuth();

  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      phoneNumber: "",
      email: "",
      password: "",
      acceptTerms: false,
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
        imageShown={false}
      />

      {signUpError && (
        <ErrorBanner
          message={signUpError.userMessage}
          isNetworkError={signUpError.isNetworkError}
        />
      )}

      <SignUpForm
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isSigningUp}
      />

      <AuthFooter
        prompt="Masz już konto? "
        actionLabel="Zaloguj się"
        onPress={() => router.back()}
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
