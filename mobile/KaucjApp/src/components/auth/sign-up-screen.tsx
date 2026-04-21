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
import { signUpSchema, SignUpValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";

export default function SignUpScreen() {
  const { signUp, isSigningUp, signUpError } = useAuth();
  const isLoading = false;

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

  const onSubmit = async (data: SignUpValues) => {
    signUp(data);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Swtórz konto</Text>
            <Text style={styles.subtitle}>
              Zarejestruj się, aby cieszyć się kaucjomatami!
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
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
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    placeholder="Imię"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.validationText}>
                  {errors.firstName.message}
                </Text>
              )}
            </View>
            <View>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Nazwisko"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.validationText}>
                  {errors.lastName.message}
                </Text>
              )}
            </View>
            <View>
              <Controller
                control={control}
                name="userName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.userName && styles.inputError]}
                    placeholder="Nazwa użytkownika"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.userName && (
                <Text style={styles.validationText}>
                  {errors.userName.message}
                </Text>
              )}
            </View>
            <View>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.phoneNumber && styles.inputError,
                    ]}
                    placeholder="Numer telefonu"
                    placeholderTextColor={colors.text.muted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.phoneNumber && (
                <Text style={styles.validationText}>
                  {errors.phoneNumber.message}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Zarejestruj się</Text>
              )}
            </TouchableOpacity>
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
    marginTop: spacing.xs,
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
