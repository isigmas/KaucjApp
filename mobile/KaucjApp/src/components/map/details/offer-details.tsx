import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Offer } from "@/src/types";
import { colors, spacing, rounded } from "@/src/theme";
import { formatDate, getOfferStatusColor } from "@/src/lib";
import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";

interface OfferDetailsProps {
  offer: Offer;
}

export default function OfferDetails({ offer }: OfferDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.offerId}>Szczegóły oferty</Text>
          <Text style={styles.dateText}>{formatDate(offer.created_at)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getOfferStatusColor(offer.status) },
          ]}
        >
          <Text style={styles.statusText}>{offer.status}</Text>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.card}>
        <View style={[styles.itemRow]}>
          <View style={styles.itemInfo}>
            <Text style={styles.primaryText}>Butelki plastikowe</Text>
            <Text style={styles.secondaryText}>
              Ilość: {offer.plastic_quantity} •{" "}
              {offer.plastic_price
                ? `cena: ${offer.plastic_price.toFixed(2)}zł`
                : "Brak podanej ceny"}
            </Text>
          </View>
          <Text style={styles.itemPrice}>
            {offer.plastic_price
              ? (offer.plastic_price * offer.plastic_quantity).toFixed(2)
              : 0}{" "}
            zł
          </Text>
        </View>
        <View style={[styles.itemRow]}>
          <View style={styles.itemInfo}>
            <Text style={styles.primaryText}>Puszki</Text>
            <Text style={styles.secondaryText}>
              Ilość: {offer.can_quantity} •{" "}
              {offer.can_price
                ? `cena: ${offer.can_price.toFixed(2)}zł`
                : "Brak podanej ceny"}
            </Text>
          </View>
          <Text style={styles.itemPrice}>
            {offer.can_price
              ? (offer.can_price * offer.can_quantity).toFixed(2)
              : 0}{" "}
            zł
          </Text>
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

      {/* Summary Footer */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Łączna liczba butelek</Text>
          <Text style={styles.summaryValue}>{offer.total_quantity}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.summaryLabelTotal}>Całkowita wartość</Text>
          <Text style={styles.summaryValueTotal}>
            {offer.total_prize.toFixed(2)} zł
          </Text>
        </View>
        <View style={[styles.summaryRow]}>
          <Text style={styles.summaryLabelTotal}>Całkowity zysk</Text>
          <Text style={styles.summaryValueTotal}>
            {offer.total_income.toFixed(2)} zł
          </Text>
        </View>
      </View>

      <ReserveButton offerId={offer.offer_id} />
    </View>
  );
}

interface ReserveButtonProps {
  offerId: number;
  onSuccessCallback?: () => void;
}

export const ReserveButton: React.FC<ReserveButtonProps> = ({
  offerId,
  onSuccessCallback,
}) => {
  const { mutate: changeOfferStatus, isPending } = useChangeOfferStatus();

  const handleReserve = () => {
    if (isPending) return;

    changeOfferStatus(
      { offerId, newStatus: "RESERVED" },
      {
        onSuccess: () => {
          Alert.alert("Sukces", "Oferta została pomyślnie zarezerwowana!");
          if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            "Nie udało się zarezerwować oferty.";
          Alert.alert("Błąd", errorMessage);
        },
      },
    );
  };

  return (
    <Pressable
      onPress={handleReserve}
      disabled={isPending}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? colors.primary.dark : colors.primary.base,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderRadius: rounded.xl,
          alignSelf: "center",
          marginTop: spacing.lg,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
          opacity: isPending ? 0.7 : 1,
        },
      ]}
    >
      {isPending && (
        <ActivityIndicator color={colors.text.white} size="small" />
      )}

      <Text
        style={{ color: colors.text.white, fontWeight: "600", fontSize: 20 }}
      >
        {isPending ? "Rezerwowanie..." : "Zarezerwuj"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
  },
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
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
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

  summaryCard: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
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
