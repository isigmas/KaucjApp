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
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, spacing } from "@/src/theme";
import { signInSchema, SignInValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";
import { ResetOnboardingButton } from "../onboarding/reset-onboarding-button";

// Import your new components
import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { AuthHeader } from "@/src/components/auth/auth-header";

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

  const onSubmit = async (data: SignInValues) => {
    Keyboard.dismiss();
    try {
      await signIn(data);
    } catch (error) {
      console.log("[frontend] Logowanie nie powiodło się", error);
    }
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
        >
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.content}
          >
            <AuthHeader
              title="Siema!"
              subtitle="Zaloguj się, aby korzystać z aplikacji"
            />

            <View style={styles.formContainer}>
              {signInError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>
                    {signInError.message ||
                      "Nie można się zalogować. Sprawdź dane."}
                  </Text>
                </View>
              )}

              <AuthInput
                control={control}
                name="email"
                icon="mail"
                placeholder="Adres email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />

              <AuthInput
                control={control}
                name="password"
                icon="lock"
                placeholder="Hasło"
                isPassword
                error={errors.password?.message}
              />

              <AuthButton
                label="Zaloguj się"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSigningIn}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Nie masz konta? </Text>
              <TouchableOpacity
                onPress={() => router.push("/sign-up")}
                activeOpacity={0.6}
              >
                <Text style={styles.footerAction}>Zarejestruj się</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.testFooter}>
              <Text
                style={[
                  styles.footerText,
                  { textAlign: "center", marginBottom: 10 },
                ]}
              >
                Tylko dla testów, najepiej po kliknięciu odświezyć expo go
              </Text>
              <ResetOnboardingButton />
            </View> */}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  formContainer: { width: "100%" },
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
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  footerText: { fontSize: 15, color: colors.text.secondary },
  footerAction: { fontSize: 15, fontWeight: "700", color: colors.primary.dark },
  testFooter: { marginTop: 40, alignItems: "center", opacity: 0.5 },
});
