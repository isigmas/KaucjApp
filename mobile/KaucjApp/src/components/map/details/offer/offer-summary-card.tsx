import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Offer } from "@/src/types";
import { colors, rounded, spacing } from "@/src/theme";

interface OfferSummaryCardProps {
  offer: Offer;
}

export function OfferSummaryCard({ offer }: OfferSummaryCardProps) {
  return (
    <View style={styles.card}>
      <SummaryRow
        label="Łączna liczba opakowań kaucyjnych"
        value={String(offer.total_quantity)}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Całkowita cena oferty"
        value={`${offer.total_prize.toFixed(2)} zł`}
        isBold
      />

      <SummaryRow
        label="Łączna wartość kaucji"
        value={`${(offer.total_quantity * 0.5).toFixed(2)} zł`}
        isBold
      />

      <SummaryRow
        label="Całkowity zysk"
        value={`${offer.total_income.toFixed(2)} zł`}
        isBold
      />
    </View>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  isBold?: boolean;
}

export function SummaryRow({ label, value, isBold = false }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, isBold && styles.labelBold]}>{label}</Text>
      <Text style={[styles.value, isBold && styles.valueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.primary.base,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.primary.dark,
  },
  labelBold: {
    fontSize: 16,
    fontWeight: "700",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  valueBold: {
    fontSize: 20,
    fontWeight: "800",
  },
});
