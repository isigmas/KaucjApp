import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Offer, OfferStatus } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";

interface OfferDetailsProps {
  offer: Offer;
}

// Helper to determine badge color based on status
const getStatusColor = (status: OfferStatus) => {
  switch (status) {
    case OfferStatus.OPEN:
      return colors.primary.base;
    case OfferStatus.RESERVED:
      return colors.accent.base;
    case OfferStatus.COMPLETED:
      return colors.status.success;
    case OfferStatus.CANCELED:
      return colors.status.error;
    default:
      return colors.text.muted;
  }
};

export default function OfferDetails({ offer }: OfferDetailsProps) {
  // Calculate total quantity and price dynamically
  const totals = useMemo(() => {
    return offer.items.reduce(
      (acc, item) => {
        acc.quantity += item.quantity;
        acc.price += (item.unit_price + item.deposit_fee) * item.quantity;
        return acc;
      },
      { quantity: 0, price: 0 },
    );
  }, [offer.items]);

  return (
    <View style={styles.container}>
      {/* Header: ID & Status */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.offerId}>Oferta #{offer.offer_id}</Text>
          <Text style={styles.dateText}>
            {new Date(offer.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(offer.status) },
          ]}
        >
          <Text style={styles.statusText}>{offer.status}</Text>
        </View>
      </View>

      {/* Location Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Adres odbioru</Text>
        <Text style={styles.primaryText}>{offer.pickup_address}</Text>

        {offer.pickup_instructions && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionLabel}>Instrukcje:</Text>
            <Text style={styles.secondaryText}>
              {offer.pickup_instructions}
            </Text>
          </View>
        )}
      </View>

      {/* Items List */}
      <Text style={styles.sectionTitle}>Przedmioty</Text>
      <View style={styles.card}>
        {offer.items.map((item, index) => {
          const itemTotal =
            (item.unit_price + item.deposit_fee) * item.quantity;
          return (
            <View
              key={`item-${item.bottle_id}-${index}`}
              style={[
                styles.itemRow,
                index !== offer.items.length - 1 && styles.borderBottom,
              ]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.primaryText}>{item.bottle_name}</Text>
                <Text style={styles.secondaryText}>
                  Ilość: {item.quantity} • Kaucja: $
                  {item.deposit_fee.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>${itemTotal.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>

      {/* Summary Footer */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Łączna liczba butelek</Text>
          <Text style={styles.summaryValue}>{totals.quantity}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.summaryLabelTotal}>Całkowita wartość</Text>
          <Text style={styles.summaryValueTotal}>
            ${totals.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header section
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  offerId: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  dateText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: rounded.pill,
  },
  statusText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Cards & Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
  },

  // Typography
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

  // Instructions
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

  // Items List
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.status.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.primary.base,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.primary.dark,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary.dark,
  },
});
