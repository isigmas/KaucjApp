import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SectionCard from "../section-card";

interface OfferSummaryCardProps {
  offer: Offer;
  isInMyOffers?: boolean;
}

export function OfferSummaryCard({
  offer,
  isInMyOffers = false,
}: OfferSummaryCardProps) {
  return (
    <SectionCard style={styles.card}>
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

      {!isInMyOffers && (
        <>
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
        </>
      )}
    </SectionCard>
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
    borderWidth: 0,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.primary.base,
    marginBottom: spacing.sm,
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
