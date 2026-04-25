import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { router } from "expo-router";
import { colors, rounded, spacing } from "@/src/theme";
import { signInSchema, SignInValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";
import { ResetOnboardingButton } from "../onboarding/reset-onboarding-button";

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
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Siema!</Text>
            <Text style={styles.subtitle}>
              Zaloguj się, aby cieszyć się kaucjomatami!
            </Text>
          </View>

          <View style={styles.formContainer}>
            {signInError && (
              <Text
                style={{ color: "red", textAlign: "center", marginBottom: 10 }}
              >
                {signInError.message ||
                  "Nie można się zalogować. Sprawdź dane."}
              </Text>
            )}
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Adres email"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.validationText}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Hasło"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.validationText}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Zaloguj się</Text>
              )}
            </TouchableOpacity>
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

          <View
            style={{
              flexDirection: "column",
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <Text style={styles.footerText}>
              Tylko dla testów, najepiej po kliknięciu odświezyć expo go przez
              klikniecie r w terimnalu
            </Text>
            <ResetOnboardingButton />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.md },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  subtitle: { fontSize: 16, color: colors.text.secondary },
  formContainer: { width: "100%", gap: spacing.md },

  input: {
    height: 56,
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.status.border,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  inputError: { borderColor: colors.status.error, backgroundColor: "#FEF2F2" },
  validationText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.status.error,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: colors.status.error + "15",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.status.error + "40",
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary.base,
    borderRadius: rounded.xl,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: { fontSize: 15, color: colors.text.secondary },
  footerAction: { fontSize: 15, fontWeight: "600", color: colors.primary.base },
});
