import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { Control, useController } from "react-hook-form";
import { ComplaintFormValues } from "@/src/validation";

const MAX_LENGTH = 500;
const NEAR_LIMIT_THRESHOLD = 450;

interface ComplainMessageFieldProps {
  control: Control<ComplaintFormValues>;
}

export default function ComplainMessageField({
  control,
}: ComplainMessageFieldProps) {
  const { field, fieldState } = useController({
    name: "message",
    control,
  });

  const charCount = field.value?.length ?? 0;

  return (
    <View>
      <View
        style={[
          styles.inputContainer,
          !!fieldState.error?.message && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Np. oferta zawierała wprowadzające w błąd zdjęcia…"
          placeholderTextColor={colors.text.muted}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.meta}>
        <Text
          style={[styles.error, { opacity: fieldState.error?.message ? 1 : 0 }]}
        >
          {fieldState.error?.message ?? " "}
        </Text>
        <Text
          style={[
            styles.charCount,
            charCount > NEAR_LIMIT_THRESHOLD && styles.charCountNear,
          ]}
        >
          {charCount}/{MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: rounded.xl,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 130,
  },
  inputContainerError: {
    borderColor: colors.status.error,
  },
  input: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    minHeight: 100,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  error: {
    fontSize: 12,
    color: colors.status.error,
    minHeight: 16,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.muted,
  },
  charCountNear: {
    color: colors.status.warning,
    fontWeight: "600",
  },
});
