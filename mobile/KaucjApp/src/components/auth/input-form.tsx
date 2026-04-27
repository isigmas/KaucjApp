import React, { useState, useRef, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  Animated,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";

export type AuthInputProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  icon: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
  hideErrorMessage?: boolean;
};

const AuthInputInner = <T extends FieldValues>(
  {
    control,
    name,
    icon,
    isPassword,
    hideErrorMessage,
    ...textInputProps
  }: AuthInputProps<T>,
  ref: React.ForwardedRef<TextInput>,
) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const focusAnim = useRef(new Animated.Value(0)).current;

  const animateFocus = (toValue: number) => {
    Animated.timing(focusAnim, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.wrapper}>
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => {
          const borderColor = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              error ? colors.status.error : colors.status.border,
              error ? colors.status.error : colors.primary.base,
            ],
          });

          return (
            <>
              <Animated.View style={[styles.inputContainer, { borderColor }]}>
                <Feather
                  name={icon}
                  size={20}
                  color={error ? colors.status.error : colors.text.muted}
                  style={styles.icon}
                />

                <TextInput
                  ref={ref}
                  style={styles.input}
                  placeholderTextColor={colors.text.muted}
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => animateFocus(1)}
                  onBlur={() => {
                    animateFocus(0);
                    onBlur();
                  }}
                  secureTextEntry={isPassword && !isPasswordVisible}
                  {...textInputProps}
                />

                {isPassword && (
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIsPasswordVisible(!isPasswordVisible);
                    }}
                    style={styles.eyeButton}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      color={colors.text.muted}
                    />
                  </Pressable>
                )}
              </Animated.View>

              {!hideErrorMessage && (
                <Text style={[styles.errorText, { opacity: error ? 1 : 0 }]}>
                  {error?.message || " "}
                </Text>
              )}
            </>
          );
        }}
      />
    </View>
  );
};

export const AuthInput = forwardRef(AuthInputInner) as <T extends FieldValues>(
  props: AuthInputProps<T> & { ref?: React.ForwardedRef<TextInput> },
) => React.ReactElement;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: rounded.xl,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    height: "100%",
  },
  eyeButton: { padding: 4 },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.status.error,
    marginLeft: 4,
    minHeight: 18,
  },
});
