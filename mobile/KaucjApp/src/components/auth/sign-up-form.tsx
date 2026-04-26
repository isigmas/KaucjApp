import { View, TextInput, StyleSheet } from "react-native";
import { Control, FieldErrors } from "react-hook-form";
import { useRef } from "react";

import { spacing } from "@/src/theme";
import { SignUpValues } from "@/src/types";
import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { ErrorBanner } from "@/src/components/auth/error-banner";

type Props = {
  control: Control<SignUpValues>;
  errors: FieldErrors<SignUpValues>;
  onSubmit: () => void;
  isLoading: boolean;
  error?: Error | null;
};

export function SignUpForm({
  control,
  errors,
  onSubmit,
  isLoading,
  error,
}: Props) {
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const userNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {error && (
        <ErrorBanner
          message={error.message}
          fallback="Nie można Stworzyć konta. Sprawdź dane."
        />
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

      <View style={styles.nameRow}>
        <View style={styles.nameField}>
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
        <View style={styles.nameField}>
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
        onSubmitEditing={onSubmit}
      />

      <AuthButton
        label="Zarejestruj się"
        onPress={onSubmit}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
});
