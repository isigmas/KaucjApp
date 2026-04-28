import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { SummaryRow } from "../offer-summary-card";

interface EarningsSummaryProps {
  totalPrize: number;
  totalIncome: number;
  totalQuantity: number;
}

export default function EarningsSumary({
  totalIncome,
  totalPrize,
  totalQuantity,
}: EarningsSummaryProps) {
  return (
    <View style={styles.card}>
      <SummaryRow
        label="Łączna liczba opakowań kaucyjnych"
        value={String(totalQuantity)}
      />
      <SummaryRow
        label="Całkowita cena oferty"
        value={`${totalPrize.toFixed(2)} zł`}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Całkowity zysk"
        value={`${totalIncome.toFixed(2)} zł`}
        isBold
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.xl,
    padding: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.primary.base,
    marginVertical: spacing.sm,
  },
});
