import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CardTitle from "../card-title";
import SectionCard from "../section-card";

interface OfferItemsCardProps {
  offer: Offer;
  /**
   * When true, renders only the inner rows without a SectionCard wrapper or
   * title. Useful when embedding inside another card (e.g. an expandable one).
   */
  bare?: boolean;
}

export default function OfferItemsCard({
  offer,
  bare = false,
}: OfferItemsCardProps) {
  const body = (
    <View style={bare ? styles.bareContainer : undefined}>
      <ItemRow
        label="Butelki plastikowe"
        quantity={offer.plastic_quantity}
        price={offer.plastic_price}
      />
      <View style={styles.rowDivider} />
      <ItemRow
        label="Puszki"
        quantity={offer.can_quantity}
        price={offer.can_price}
      />
    </View>
  );

  if (bare) return body;

  return (
    <SectionCard>
      <CardTitle>Opakowania kaucyjne</CardTitle>
      {body}
    </SectionCard>
  );
}

interface ItemRowProps {
  label: string;
  quantity: number;
  price: number | null | undefined;
}

function ItemRow({ label, quantity, price }: ItemRowProps) {
  const total = price ? (price * quantity).toFixed(2) : "0";
  const priceLabel = price
    ? `cena(szt): ${price.toFixed(2)}zł`
    : "Brak podanej ceny";

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.primaryText}>{label}</Text>
        <Text style={styles.secondaryText}>
          Ilość: {quantity} • {priceLabel}
        </Text>
      </View>
      <Text style={styles.price}>{total} zł</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bareContainer: {
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.status.border,
    opacity: 0.6,
  },
  info: {
    flex: 1,
  },
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
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
