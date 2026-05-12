import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Offer } from "@/src/types";
import { colors, rounded, spacing } from "@/src/theme";
import SectionCard from "../../section-card";
import CardTitle from "../../card-title";

interface OfferReviewCardProps {
  offer: Offer;
}

export default function OfferReviewCard({ offer }: OfferReviewCardProps) {
  return (
    <SectionCard>
      <CardTitle>Szczegóły odbioru</CardTitle>
      <Text style={styles.address}>{offer.pickup_address}</Text>

      <View style={styles.divider} />

      <LineItem
        label="Butelki plastikowe"
        sub={`${offer.plastic_quantity} szt. × ${offer.plastic_price?.toFixed(2) ?? "—"} zł`}
        value={
          offer.plastic_price
            ? (offer.plastic_price * offer.plastic_quantity).toFixed(2)
            : "0.00"
        }
      />
      <LineItem
        label="Puszki"
        sub={`${offer.can_quantity} szt. × ${offer.can_price?.toFixed(2) ?? "—"} zł`}
        value={
          offer.can_price
            ? (offer.can_price * offer.can_quantity).toFixed(2)
            : "0.00"
        }
      />
    </SectionCard>
  );
}

function LineItem({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.rowValue}>{value} zł</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  address: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  rowLeft: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  rowSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
