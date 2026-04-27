import { View, Keyboard, TextInput, StyleSheet } from "react-native";
import { Control, FieldErrors } from "react-hook-form";
import { useRef } from "react";

import { SignInValues } from "@/src/types";
import { AuthInput } from "@/src/components/auth/input-form";
import { AuthButton } from "@/src/components/auth/auth-button";

type Props = {
  control: Control<SignInValues>;
  errors: FieldErrors<SignInValues>;
  onSubmit: () => void;
  isLoading: boolean;
};

export function SignInForm({ control, errors, onSubmit, isLoading }: Props) {
  const passwordRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <AuthInput
        control={control}
        name="email"
        icon="mail"
        placeholder="Adres e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <AuthInput
        ref={passwordRef}
        control={control}
        name="password"
        icon="lock"
        placeholder="Hasło"
        isPassword
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      <AuthButton
        label="Zaloguj się"
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
});
