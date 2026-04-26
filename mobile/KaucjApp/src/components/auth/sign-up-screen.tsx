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
import { signUpSchema, SignUpValues } from "@/src/types";
import { useAuth } from "@/src/auth/use-auth";

import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { AuthHeader } from "@/src/components/auth/auth-header";

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
              <AuthInput
                control={control}
                name="email"
                icon="mail"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AuthInput
                    control={control}
                    name="firstName"
                    icon="user"
                    placeholder="Imię"
                    error={errors.firstName?.message}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <AuthInput
                    control={control}
                    name="lastName"
                    icon="user"
                    placeholder="Nazwisko"
                    error={errors.lastName?.message}
                  />
                </View>
              </View>

              <AuthInput
                control={control}
                name="userName"
                icon="at-sign"
                placeholder="Nazwa użytkownika"
                autoCapitalize="none"
                error={errors.userName?.message}
              />

              <AuthInput
                control={control}
                name="phoneNumber"
                icon="phone"
                placeholder="Numer telefonu"
                keyboardType="numeric"
                error={errors.phoneNumber?.message}
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
  row: { flexDirection: "row", justifyContent: "space-between" },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  footerText: { fontSize: 15, color: colors.text.secondary },
  footerAction: { fontSize: 15, fontWeight: "700", color: colors.primary.dark },
});
