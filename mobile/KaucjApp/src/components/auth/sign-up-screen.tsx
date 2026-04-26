import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, spacing } from "@/src/theme";
import { signUpSchema, SignUpValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";

import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { AuthHeader } from "@/src/components/auth/auth-header";
import { useRef } from "react";

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

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const userNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const onSubmit = async (data: SignUpValues) => {
    Keyboard.dismiss();
    signUp(data);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.content}
          >
            <AuthHeader
              title="Stwórz konto"
              subtitle="Zarejestruj się i bądź częścią społeczności!"
            />

            <View style={styles.formContainer}>
              {signUpError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    {signUpError.message ||
                      "Nie można Stworzyć konta. Sprawdź dane."}
                  </Text>
                </View>
              )}
              <AuthInput
                control={control}
                name="email"
                icon="mail"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => firstNameRef.current?.focus()}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AuthInput
                    ref={firstNameRef}
                    control={control}
                    name="firstName"
                    icon="user"
                    placeholder="Imię"
                    error={errors.firstName?.message}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AuthInput
                    ref={lastNameRef}
                    control={control}
                    name="lastName"
                    icon="user"
                    placeholder="Nazwisko"
                    error={errors.lastName?.message}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => userNameRef.current?.focus()}
                  />
                </View>
              </View>

              <AuthInput
                ref={userNameRef}
                control={control}
                name="userName"
                icon="at-sign"
                placeholder="Nazwa użytkownika"
                autoCapitalize="none"
                error={errors.userName?.message}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => phoneNumberRef.current?.focus()}
              />

              <AuthInput
                ref={phoneNumberRef}
                control={control}
                name="phoneNumber"
                icon="phone"
                placeholder="Numer telefonu"
                keyboardType="numeric"
                error={errors.phoneNumber?.message}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <AuthInput
                ref={passwordRef}
                control={control}
                name="password"
                icon="lock"
                placeholder="Hasło"
                isPassword
                error={errors.password?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />

              <AuthButton
                label="Zarejestruj się"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSigningUp}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Masz już konto? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)")}
                activeOpacity={0.6}
              >
                <Text style={styles.footerAction}>Zaloguj się</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 40,
  },
  formContainer: { width: "100%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  footerText: { fontSize: 15, color: colors.text.secondary },
  footerAction: { fontSize: 15, fontWeight: "700", color: colors.primary.dark },

  //error
  errorBanner: {
    backgroundColor: colors.status.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  errorBannerText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: "500",
  },
});
