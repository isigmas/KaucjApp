import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";
import { formatDate, getOfferStatusConfig } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer, OfferStatus } from "@/src/types";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";

export default function ReservedOfferCard({ offer }: { offer: Offer }) {
  const formattedDate = formatDate(offer.reserved_to!);
  const formattedPrice = `${offer.total_prize.toFixed(2)} PLN`;
  const formattedQuantity = `${offer.total_quantity} szt.`;

  const { mutate: changeOfferStatus, isPending } = useChangeOfferStatus();

  const handleCompleteOffer = () => {
    if (isPending) return;
    const offerId = offer.offer_id;

    changeOfferStatus(
      { offerId, newStatus: "COMPLETED" },
      {
        onSuccess: () => {
          Alert.alert("Sukces", "Oferta została pomyślnie zakończona!");
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || "Nie udało się zakończyć oferty.";
          Alert.alert("Błąd", errorMessage);
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <CardHeader status={offer.status} date={formattedDate} />
      <PickupAddress address={offer.pickup_address} />
      <OfferStats quantity={formattedQuantity} price={formattedPrice} />
      <ContactButton onPress={() => {}} />
      <ConfirmButton onPress={handleCompleteOffer} />
    </View>
  );
}

function StatusBadge({ status }: { status: OfferStatus }) {
  const { color, label } = getOfferStatusConfig(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}>
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
}

function StatBox({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function CardHeader({ status, date }: { status: OfferStatus; date: string }) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.dateText}>rezerwacja aktywna do: {date}</Text>
    </View>
  );
}

function PickupAddress({ address }: { address: string }) {
  return (
    <>
      <Text style={styles.addressTitle}>Adres odbioru</Text>
      <Text style={styles.addressText} numberOfLines={2}>
        {address}
      </Text>
    </>
  );
}

function OfferStats({ quantity, price }: { quantity: string; price: string }) {
  return (
    <View style={styles.statsRow}>
      <StatBox label="Ilość" value={quantity} />
      <StatBox label="Do zapłaty" value={price} valueStyle={styles.priceText} />
    </View>
  );
}

function ContactButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.contactButton}>
      <Text style={styles.contactButtonText}>
        Skontaktuj się ze sprzedającym
      </Text>
    </Pressable>
  );
}

function ConfirmButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.confirmButton,
        {
          backgroundColor: pressed ? colors.primary.dark : colors.primary.base,
        },
      ]}
    >
      <Text style={styles.confirmButtonText}>Potwierdź odbiór opakowań</Text>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.border,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: rounded.pill,
  },
  statusBadgeText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dateText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  addressTitle: {
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "700",
  },
  priceText: {
    color: colors.primary.base,
  },
  contactButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: colors.primary.base,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: colors.text.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
