import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { colors, rounded, spacing } from "@/src/theme";
import * as Haptics from "expo-haptics";

export type AuthInputProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  error?: string;
  icon: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
};

const AuthInputInner = <T extends FieldValues>(
  {
    control,
    name,
    error,
    icon,
    isPassword,
    ...textInputProps
  }: AuthInputProps<T>,
  ref: React.ForwardedRef<TextInput>,
) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
  const isFocused = useSharedValue(0);

  const togglePasswordVisibility = () => {
    Haptics.selectionAsync();
    setIsPasswordVisible(!isPasswordVisible);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      isFocused.value,
      [0, 1],
      [
        error ? colors.status.error : colors.status.border,
        error ? colors.status.error : colors.primary.base,
      ],
    );
    const backgroundColor = interpolateColor(
      isFocused.value,
      [0, 1],
      [error ? "#FEF2F2" : colors.background.card, "#FFFFFF"],
    );

    return {
      borderColor,
      backgroundColor,
      shadowOpacity: withTiming(isFocused.value ? 0.1 : 0.02),
    };
  });

  return (
    <View style={styles.wrapper}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Animated.View
            style={[styles.inputContainer, animatedContainerStyle]}
          >
            <Feather
              name={icon}
              size={20}
              color={
                error
                  ? colors.status.error
                  : isFocused.value
                    ? colors.primary.base
                    : colors.text.muted
              }
              style={styles.icon}
            />

            <TextInput
              ref={ref}
              style={styles.input}
              placeholderTextColor={colors.text.muted}
              onFocus={() => {
                isFocused.value = withTiming(1);
              }}
              onBlur={() => {
                isFocused.value = withTiming(0);
                onBlur();
              }}
              onChangeText={onChange}
              value={value}
              secureTextEntry={isPassword && !isPasswordVisible}
              {...textInputProps}
            />

            {isPassword && (
              <Pressable
                onPress={togglePasswordVisibility}
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
        )}
      />

      <Text style={styles.errorText}>{error || " "}</Text>
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
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
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
