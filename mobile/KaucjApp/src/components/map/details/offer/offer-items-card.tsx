import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Offer } from "@/src/types";
import { colors, spacing } from "@/src/theme";
import SectionCard from "../section-card";

interface OfferItemsCardProps {
  offer: Offer;
}

export default function OfferItemsCard({ offer }: OfferItemsCardProps) {
  return (
    <SectionCard>
      <ItemRow
        label="Butelki plastikowe"
        quantity={offer.plastic_quantity}
        price={offer.plastic_price}
      />
      <ItemRow
        label="Puszki"
        quantity={offer.can_quantity}
        price={offer.can_price}
      />
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
    ? `cena: ${price.toFixed(2)}zł`
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
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
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
