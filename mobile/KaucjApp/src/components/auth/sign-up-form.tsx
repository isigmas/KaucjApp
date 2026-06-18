import { View, TextInput, StyleSheet } from "react-native";
import { Control, FieldErrors, useWatch } from "react-hook-form";
import { useRef } from "react";

import { spacing } from "@/src/theme";
import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";
import { ErrorBanner } from "@/src/components/auth/error-banner";
import PasswordChecklist from "./password-checklist";
import { AuthCheckbox } from "@/src/components/auth/auth-checkbox";
import { SignUpValues } from "@/src/validation";

type Props = {
  control: Control<SignUpValues>;
  onSubmit: () => void;
  isLoading: boolean;
  error?: Error | null;
};

export function SignUpForm({ control, onSubmit, isLoading, error }: Props) {
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const userNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const passwordValue = useWatch({
    control,
    name: "password",
  });

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
        autoComplete="email"
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
            autoComplete="given-name"
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
            autoComplete="family-name"
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
        autoComplete="off"
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
        autoComplete="tel"
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
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        hideErrorMessage={true}
      />
      <PasswordChecklist password={passwordValue} />

      <AuthCheckbox control={control} name="acceptTerms" />

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
