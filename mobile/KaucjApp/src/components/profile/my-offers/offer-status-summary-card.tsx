import SectionCard from "@/src/components/map/details/section-card";
import Countdown from "@/src/components/profile/reserved-offers/countdown";
import { formatDate, formatPrice, getPolishPackageQuantity } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Hourglass,
  Truck,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import CourierCard from "./courier-card";
import { useConfirmOffer } from "@/src/api/hooks/use-offer";
import { ActionButton } from "./offer-actions";

interface OfferHeadlineProps {
  offer: Offer;
}

export default function OfferStatusSummaryCard({ offer }: OfferHeadlineProps) {
  const { mutate: confirmOffer, isPending } = useConfirmOffer(offer.offer_id);

  const isReserved = offer.status === "RESERVED";
  const isPendingConfirmation = offer.status === "PENDING_CONFIRMATION";
  const isComplaint = offer.status === "COMPLAINT";

  const showCourierDetails =
    (isReserved && offer.reserved_to) || isPendingConfirmation || isComplaint;

  const handleComplete = () => {
    Alert.alert(
      "Potwierdź odbiór",
      "Czy kurier odebrał już opakowania? Potwierdzenie odbioru zakończy ofertę.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Potwierdź",
          style: "default",
          onPress: () => {
            confirmOffer();
          },
        },
      ],
    );
  };

  const handleComplaint = () => {
    Alert.alert(
      "Potwierdź rozwiązanie problemu",
      "Czy rozwiązaliście problem z ofertą? Potwierdzenie rozwiązania problemu zakończy ofertę.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Potwierdź",
          style: "default",
          onPress: () => {
            confirmOffer();
          },
        },
      ],
    );
  };

  return (
    <SectionCard style={styles.card}>
      {!isReserved && <OfferSatusPill status={offer.status} />}

      <StatusHeader offer={offer} />

      {showCourierDetails ? (
        <>
          <View style={styles.hairline} />
          <CourierCard asCard={false} />
          <View style={styles.hairline} />

          {isReserved && offer.reserved_to && (
            <Countdown
              expiresAt={offer.reserved_to}
              variant="block"
              showBorder={false}
            />
          )}

          {isPendingConfirmation && (
            <>
              <ActionButton
                onPress={handleComplete}
                disabled={isPending}
                isPending={isPending}
                label="Potwierdź odbiór opakowań"
                icon={<CheckCircle size={18} color={colors.text.white} />}
              />
              <Text style={styles.hint}>
                Potwierdzenie odbioru kuriera zakończy ofertę.
              </Text>
            </>
          )}
          {isComplaint && (
            <>
              <ActionButton
                backgroundColor={colors.status.error}
                onPress={handleComplaint}
                disabled={isPending}
                isPending={isPending}
                label="Potwierdź rozwiązanie problemu"
                icon={<CheckCircle size={18} color={colors.text.white} />}
              />
              <Text style={styles.hint}>
                Potwierdzenie rozwiązania problemu zakończy ofertę.
              </Text>
            </>
          )}
        </>
      ) : (
        <DateRow offer={offer} />
      )}
    </SectionCard>
  );
}

function StatusHeader({ offer }: OfferHeadlineProps) {
  const content = getStatusContent(offer);
  return (
    <>
      <View style={styles.heading}>
        {content.icon}
        <Text style={styles.title}>{content.title}</Text>
      </View>
      <Text style={styles.description}>{content.description}</Text>
    </>
  );
}

function getStatusContent(offer: Offer) {
  const qty = getPolishPackageQuantity(offer.total_quantity, true);
  const price = formatPrice(offer.total_prize);

  switch (offer.status) {
    case "OPEN":
      return {
        title: "Czeka na kuriera",
        description: `Po rezerwacji kurier odbierze ${qty} za ${price}.`,
        icon: <Hourglass size={18} color={colors.primary.base} />,
      };
    case "RESERVED":
      return {
        title: "Oferta zarezerwowana",
        description: `Przygotuj ${qty}, za które otrzymasz kwotę ${price} od kuriera.`,
        icon: (
          <Truck
            size={22}
            color={colors.status.warning}
            absoluteStrokeWidth={true}
          />
        ),
      };
    case "PENDING_CONFIRMATION":
      return {
        title: "Czeka na potwierdzenie",
        description: `Kurier potwierdził odbiór ${qty} za ${price}.`,
        icon: <Hourglass size={18} color={colors.primary.base} />,
      };

    case "COMPLETED":
      return {
        title: "Oferta zakończona",
        description: `Kurier odebrał ${qty}. Otrzymano ${price}.`,
        icon: <CheckCircle2 size={18} color={colors.status.success} />,
      };
    case "CANCELED":
      return {
        title: "Oferta anulowana",
        description:
          "Ta oferta została anulowana i nie jest już widoczna dla kurierów.",
        icon: <XCircle size={18} color={colors.status.error} />,
      };
    case "COMPLAINT":
      return {
        title: "Zgłoszono problem",
        description: `Kurier zgłosił problem z ofertą. Skontaktuj się z nim aby rozwiązać sprawę.`,
        icon: <AlertCircle size={18} color={colors.status.error} />,
      };
  }
}

interface DateRowProps {
  offer: Offer;
}

function DateRow({ offer }: DateRowProps) {
  const showReservedAt = !!offer.reserved_at && offer.status !== "OPEN";
  const reservedAccent =
    offer.status === "RESERVED" ? colors.status.warning : colors.text.muted;

  return (
    <View style={styles.datesRow}>
      <DateChip
        icon={<Clock3 size={12} color={colors.text.muted} />}
        label="Utworzono"
        value={formatDate(offer.created_at)}
      />
      {showReservedAt ? (
        <DateChip
          icon={<Calendar size={12} color={reservedAccent} />}
          label="Zarezerwowano"
          value={formatDate(offer.reserved_at!)}
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
    paddingVertical: spacing.md,
  },

  statusHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
  },

  hairline: {
    height: 1,
    backgroundColor: colors.status.border,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  // Dates row
  datesRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dateChip: {
    flex: 1,
    gap: 3,
  },
  dateChipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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

  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
