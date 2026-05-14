import SectionCard from "@/src/components/map/details/section-card";
import Countdown from "@/src/components/profile/reserved-offers/countdown";
import { formatDate, formatPrice, getPolishPackageQuantity } from "@/src/lib";
import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Hourglass,
  Truck,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import ContactCard from "@/src/components/ui/contact-card";
import { useConfirmOffer } from "@/src/api/hooks/use-offer";
import { ActionButton } from "./offer-actions";
import { useRouter } from "expo-router";
import ComplaintCard from "./complaint-card";

interface OfferHeadlineProps {
  offer: Offer;
}

export default function OfferStatusSummaryCard({ offer }: OfferHeadlineProps) {
  const router = useRouter();
  const { mutate: confirmOffer, isPending } = useConfirmOffer(offer.offerId);

  const isReserved = offer.status === "RESERVED";
  const isPendingConfirmation = offer.status === "PENDING_CONFIRMATION";
  const isConfirmedByCreator = offer.creatorConfirmed;
  const isComplaint = offer.status === "COMPLAINT";
  const isCompleted = offer.status === "COMPLETED";

  const showStatusPill =
    !isReserved && !isPendingConfirmation && !isComplaint && !isCompleted;
  const showCourierDetails =
    (isReserved && offer.reservedTo) ||
    isPendingConfirmation ||
    isComplaint ||
    offer.collectorId;
  const courierHeaderText = isCompleted
    ? "Kto odebrał opakowania?"
    : "Kto odbiera opakowania?";

  const handleComplete = () => {
    const alertDescription = isPendingConfirmation
      ? "Kurier potwierdził odbiór opakowań. Również potwierdź odbiór opakowań aby zakończyć ofertę."
      : "Czy kurier odebrał już opakowania?";
    Alert.alert("Potwierdź odbiór", alertDescription, [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Potwierdź",
        style: "default",
        onPress: () => {
          confirmOffer(undefined, {
            onSuccess: () => {
              if (isPendingConfirmation) {
                router.push({
                  pathname: "/profile/offers/confirmation",
                  params: { type: "success" },
                });
              }
            },
          });
        },
      },
    ]);
  };

  const handleComplaint = () => {
    router.push({
      pathname: "/profile/offers/complaint",
      params: { id: offer.offerId },
    });
  };

  return (
    <SectionCard style={styles.card}>
      {showStatusPill && <OfferSatusPill status={offer.status} />}

      <StatusHeader offer={offer} />
      {isComplaint && <ComplaintCard offerId={offer.offerId} />}

      {showCourierDetails ? (
        <>
          <View style={styles.hairline} />
          <ContactCard
            asCard={false}
            userId={offer.collectorId}
            header={courierHeaderText}
          />
          <View style={styles.hairline} />

          {isReserved && offer.reservedTo && (
            <ReservedState
              expiresAt={offer.reservedTo}
              onConfirm={handleComplete}
              isPending={isPending}
            />
          )}

          {isPendingConfirmation && !isConfirmedByCreator && (
            <ActionButton
              onPress={handleComplete}
              disabled={isPending}
              isPending={isPending}
              label="Potwierdź odbiór kuriera"
              icon={<CheckCircle size={18} color={colors.text.white} />}
            />
          )}

          {!isCompleted && !isConfirmedByCreator && (
            <Pressable onPress={handleComplaint}>
              <Text style={styles.hintError}>Zgłoś problem</Text>
            </Pressable>
          )}
        </>
      ) : (
        <DateRow offer={offer} />
      )}
    </SectionCard>
  );
}

export function ReservedState({
  expiresAt,
  onConfirm,
  isPending,
}: {
  expiresAt: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <View style={{ gap: spacing.sm }}>
        <Countdown expiresAt={expiresAt} variant="block" showBorder={false} />
        <ActionButton
          onPress={onConfirm}
          disabled={isPending}
          isPending={isPending}
          label="Potwierdź odbiór opakowań"
          icon={<CheckCircle size={18} color={colors.text.white} />}
        />
      </View>
    </>
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
  const qty = getPolishPackageQuantity(offer.totalQuantity, true);
  const price = formatPrice(offer.totalPrize);
  const isConfirmedByCreator = offer.creatorConfirmed;

  switch (offer.status) {
    case "OPEN":
      return {
        title: "Czeka na kuriera",
        description: `Oczekiwanie na kuriera, który odbierze od Ciebie ${qty} za ${price}.`,
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
      if (isConfirmedByCreator) {
        return {
          title: "Czeka na potwierdzenie",
          description: `Potwierdziłeś odbiór opakowań. Oczekiwanie na potwierdzenie od kuriera.`,
          icon: <CheckCircle size={18} color={colors.status.success} />,
        };
      }
      return {
        title: "Czeka na potwierdzenie",
        description: `Kurier potwierdził odbiór ${qty} za ${price}. Potwierdź odbiór opakowań aby zakończyć ofertę.`,
        icon: <Hourglass size={18} color={colors.primary.base} />,
      };

    case "COMPLETED":
      return {
        title: "Oferta zakończona",
        description: `Kurier odebrał ${qty}. Otrzymano ${price}.`,
        icon: (
          <CheckCircle2
            size={18}
            absoluteStrokeWidth={true}
            color={colors.status.success}
          />
        ),
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
        description: `Otrzymano złoszenie o problemie dotyczącym tej oferty. Skontaktuj się z kurierem aby rozwiązać sprawę.`,
        icon: <AlertCircle size={18} color={colors.status.error} />,
      };
  }
}

interface DateRowProps {
  offer: Offer;
}

function DateRow({ offer }: DateRowProps) {
  const showReservedAt = !!offer.reservedAt && offer.status !== "OPEN";
  const reservedAccent =
    offer.status === "RESERVED" ? colors.status.warning : colors.text.muted;

  return (
    <View style={styles.datesRow}>
      <DateChip
        icon={<Clock3 size={12} color={colors.text.muted} />}
        label="Utworzono"
        value={formatDate(offer.createdAt)}
      />
      {showReservedAt ? (
        <DateChip
          icon={<Calendar size={12} color={reservedAccent} />}
          label="Zarezerwowano"
          value={formatDate(offer.reservedAt!)}
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
  hintError: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: colors.text.secondary,
    textDecorationStyle: "solid",
    fontWeight: "600",
  },
});
