import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Keyboard,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { colors, spacing } from "@/src/theme";
import { AuthFormWrapper } from "@/src/components/auth/auth-form-wrapper";
import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { AuthHeader } from "./auth-header";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/src/types";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    Keyboard.dismiss();
    // TODO: Call backend

    // After successful request, route to the confirmation screen
    router.push({
      pathname: "/(auth)/email-sent",
      params: { email: data.email },
    });
  };

  return (
    <AuthFormWrapper>
      <View style={styles.contentContainer}>
        <AuthHeader
          title="Zresetuj hasło"
          subtitle="Podaj swój adres e-mail, a my wyślemy Ci link do zresetowania hasła."
          imageShown={false}
        />

        <AuthInput
          ref={emailRef}
          control={control}
          name="email"
          icon="mail"
          placeholder="Adres e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <View style={styles.footer}>
          <AuthButton
            label="Wyślij link"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />

          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Wróć do logowania</Text>
          </Pressable>
        </View>
      </View>
    </AuthFormWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
  formContainer: {
    width: "100%",
  },
  footer: {
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
