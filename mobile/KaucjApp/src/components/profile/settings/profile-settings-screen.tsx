import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Controller } from "react-hook-form";

import { useProfileSettingsForm } from "./use-profile-settings";
import { colors, rounded, shadows, spacing } from "@/src/theme";

export default function ProfileSettingsScreen() {
  const { control, errors, onSubmit, isSaveDisabled, isPending } =
    useProfileSettingsForm();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DANE OSOBOWE</Text>

        <View style={styles.cardGroup}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Imię</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  placeholder="Wprowadź imię"
                  placeholderTextColor={colors.text.muted}
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            )}
          />

          <View style={styles.separator} />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Nazwisko</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  placeholder="Wprowadź nazwisko"
                  placeholderTextColor={colors.text.muted}
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
              </View>
            )}
          />
        </View>

        {(errors.firstName || errors.lastName) && (
          <View style={styles.errorContainer}>
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
        onPress={onSubmit}
        disabled={isSaveDisabled}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,

    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: spacing?.md || 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text?.muted || "#8A8A8E",
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.lg,
    padding: spacing.xs,
    ...shadows.light,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: rounded.apple,
    backgroundColor: colors.background.card,
  },
  label: {
    width: 100,
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.status.border,
  },
  errorContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary.base,
    borderRadius: rounded.apple,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary.light,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
