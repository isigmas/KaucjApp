import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SectionCard from "../../../ui/section-card";

interface OfferSummaryCardProps {
  offer: Offer;
  isInMyOffers?: boolean;
  bare?: boolean; //borderless card
}

export function OfferSummaryCard({
  offer,
  isInMyOffers = false,
  bare = false,
}: OfferSummaryCardProps) {
  const body = (
    <View style={bare ? styles.bareInner : undefined}>
      <SummaryRow
        label="Łączna liczba opakowań kaucyjnych"
        value={String(offer.totalQuantity)}
      />
      <View style={styles.divider} />
      <SummaryRow
        label="Cena oferty"
        value={`${offer.totalPrize.toFixed(2)} zł`}
        isBold
      />

      {!isInMyOffers && (
        <>
          <SummaryRow
            label="Wartość kaucji"
            value={`${(offer.totalQuantity * 0.5).toFixed(2)} zł`}
            isBold
          />

          <SummaryRow
            label="Zysk kuriera"
            value={`${offer.totalIncome.toFixed(2)} zł`}
            isBold
          />
        </>
      )}
    </View>
  );

  if (bare) return body;

  return <SectionCard style={styles.card}>{body}</SectionCard>;
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
  bareInner: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.lg,
    padding: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.primary.base,
    marginBottom: spacing.sm,
    opacity: 0.4,
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
