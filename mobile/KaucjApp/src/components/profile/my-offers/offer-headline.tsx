import SectionCard from "@/src/components/map/details/section-card";
import {
  formatDate,
  formatPrice,
  getOfferStatusConfig,
  getPolishPackageQuantity,
} from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer, OfferStatus } from "@/src/types";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Hourglass,
  Truck,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Countdown from "../reserved-offers/countdown";

interface OfferHeadlineProps {
  offer: Offer;
}

export default function OfferHeadline({ offer }: OfferHeadlineProps) {
  const { color: statusColor, label: statusLabel } = getOfferStatusConfig(
    offer.status,
  );
  const { title, description, icon } = getOfferStatusContent(offer);

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <SectionCard style={styles.card}>
        <View
          style={[styles.statusPill, { backgroundColor: statusColor + "1A" }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>

        <View style={styles.heading}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>

        {offer.status === "RESERVED" && offer.reserved_to ? (
          <View style={styles.countdownWrapper}>
            <Countdown
              expiresAt={offer.reserved_to}
              variant="block"
              showBorder={false}
            />
          </View>
        ) : null}

        <DateRow status={offer.status} offer={offer} />
      </SectionCard>
    </Animated.View>
  );
}

function getOfferStatusContent(offer: Offer) {
  const quantityLabel = getPolishPackageQuantity(offer.total_quantity, true);
  const price = formatPrice(offer.total_prize);

  switch (offer.status) {
    case "RESERVED":
      return {
        title: "Oferta zarezerwowana",
        description: `Przygotuj ${quantityLabel}, za które otrzymasz ${price} od kuriera.`,
        icon: <Truck size={18} color={colors.status.warning} />,
      };
    case "OPEN":
      return {
        title: "Czeka na kuriera",
        description: `Po rezerwacji kurier odbierze ${quantityLabel} za ${price}.`,
        icon: <Hourglass size={18} color={colors.primary.base} />,
      };
    case "COMPLETED":
      return {
        title: "Oferta zakończona",
        description: `Kurier odebrał ${quantityLabel}. Otrzymano ${price}.`,
        icon: <CheckCircle2 size={18} color={colors.status.success} />,
      };
    case "CANCELED":
      return {
        title: "Oferta anulowana",
        description:
          "Ta oferta została anulowana i nie jest już widoczna dla kurierów.",
        icon: <XCircle size={18} color={colors.status.error} />,
      };
  }
}

interface DateRowProps {
  status: OfferStatus;
  offer: Offer;
}

function DateRow({ status, offer }: DateRowProps) {
  const reservedAt = offer.reserved_at;
  const reservedAccent =
    status === "RESERVED" ? colors.status.warning : colors.text.muted;

  return (
    <View style={styles.datesRow}>
      <DateChip
        icon={<Clock3 size={13} color={colors.text.muted} />}
        label="Utworzono"
        value={formatDate(offer.created_at)}
      />
      {reservedAt && status !== "OPEN" ? (
        <DateChip
          icon={<Calendar size={13} color={reservedAccent} />}
          label="Zarezerwowano"
          value={formatDate(reservedAt)}
        />
      ) : null}
    </View>
  );
}

interface DateChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DateChip({ icon, label, value }: DateChipProps) {
  return (
    <View style={styles.dateChip}>
      <View style={styles.dateChipHeader}>
        {icon}
        <Text style={styles.dateChipLabel}>{label}</Text>
      </View>
      <Text style={styles.dateChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  countdownWrapper: {
    marginTop: spacing.sm,
  },
  datesRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dateChip: {
    flex: 1,
    gap: 3,
  },
  dateChipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateChipLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateChipValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
});
