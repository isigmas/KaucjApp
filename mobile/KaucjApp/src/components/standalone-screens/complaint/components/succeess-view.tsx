import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";

interface ComplaintSuccessViewProps {
  onClose: () => void;
}

export default function ComplaintSuccessView({
  onClose,
}: ComplaintSuccessViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name="check-circle" size={52} color={colors.primary.base} />
      </View>

      <Text style={styles.title}>Zgłoszenie wysłane</Text>

      <Text style={styles.subtitle}>
        Dziękujemy za zgłoszenie. Nasz zespół sprawdzi je jak tylko się nam
        będzie chciało.
      </Text>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onClose();
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeLabel}>Zamknij</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    backgroundColor: colors.background.card,
    gap: spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: rounded.apple,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  closeButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: rounded.apple,
    backgroundColor: colors.primary.light,
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
