import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";
import SectionCard from "../section-card";
import SectionTitle from "../card-title";

interface PickupCardProps {
  address: string;
  instructions?: string | null;
}

export default function PickupCard({ address, instructions }: PickupCardProps) {
  return (
    <SectionCard>
      <SectionTitle>Adres odbioru</SectionTitle>
      <Text style={styles.primaryText}>{address}</Text>

      {instructions ? (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>Instrukcje:</Text>
          <Text style={styles.secondaryText}>{instructions}</Text>
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  primaryText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  secondaryText: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 2,
  },
  instructionBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
  },
});
