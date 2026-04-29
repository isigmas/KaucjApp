import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing } from "@/src/theme";

export default function BookingConfirmationScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezerwacja potwierdzona</Text>
      <Text style={styles.subtitle}>Oferta #{offerId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
