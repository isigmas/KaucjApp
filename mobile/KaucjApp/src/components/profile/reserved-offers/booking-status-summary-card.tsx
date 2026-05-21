import SectionCard from "@/src/components/ui/section-card";
import { formatPrice, getPolishPackageQuantity } from "@/src/lib";
import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Hourglass,
  Truck,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useConfirmOffer } from "@/src/api/hooks/use-offer";
import { useRouter } from "expo-router";
import { ReservedState } from "../my-offers/offer-status-summary-card";
import { ActionButton } from "../my-offers/offer-actions";
import ComplaintCard from "../my-offers/complaint-card";

interface BookingStatusSummaryCardProps {
  offer: Offer;
}

export default function BookingStatusSummaryCard({
  offer,
}: BookingStatusSummaryCardProps) {
  const router = useRouter();
  const { mutate: confirmOffer, isPending } = useConfirmOffer(offer.offerId);

  const isReserved = offer.status === "RESERVED";
  const isPendingConfirmation = offer.status === "PENDING_CONFIRMATION";
  const isConfirmedByCreator = offer.creatorConfirmed;
  const isConfirmedByCollector = offer.collectorConfirmed;
  const isComplaint = offer.status === "COMPLAINT";
  const isCompleted = offer.status === "COMPLETED";

  const handleComplete = () => {
    const alertDescription = offer.creatorConfirmed
      ? "Wystawiający potwierdził odbiór opakowań. Również potwierdź odbiór opakowań aby zakończyć rezerwację."
      : "Potwierdź odbiór opakowań.";
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
                  pathname: "/profile/bookings/confirmation",
                  params: {
                    type: "success",
                    userId: offer.creatorId,
                    offerId: offer.offerId,
                  },
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
      pathname: "/profile/bookings/complaint",
      params: { id: offer.offerId },
    });
  };

  return (
    <SectionCard style={styles.card}>
      <StatusHeader offer={offer} />
      <View style={styles.hairline} />
      {isReserved && offer.reservedTo ? (
        <ReservedState
          expiresAt={offer.reservedTo}
          onConfirm={handleComplete}
          isPending={isPending}
        />
      ) : null}
      {isPendingConfirmation && isConfirmedByCreator && (
        <>
          <ActionButton
            onPress={handleComplete}
            disabled={isPending}
            isPending={isPending}
            label="Potwierdź odbiór opakowań"
            icon={<CheckCircle size={18} color={colors.text.white} />}
          />
        </>
      )}
      {isComplaint && <ComplaintCard offerId={offer.offerId} />}
      {!isConfirmedByCollector && !isCompleted && (
        <Pressable onPress={handleComplaint}>
          <Text style={styles.hintError}>Zgłoś problem</Text>
        </Pressable>
      )}
    </SectionCard>
  );
}

function StatusHeader({ offer }: { offer: Offer }) {
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
        description: `Udaj się do lokalizacji wskazanej w ofercie aby odebrać ${qty} za ${price}.`,
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
          description: `Wystawiający potwierdził odbiór ${qty} za ${price}. Potwierdź aby zakończyć rezerwację.`,
          icon: <CheckCircle size={18} color={colors.status.success} />,
        };
      }
      return {
        title: "Czeka na potwierdzenie",
        description: `Potwierdziłeś odbiór ${qty} za ${price}. Oczekiwanie na potwierdzenie od wystawiającego.`,
        icon: <Hourglass size={18} color={colors.primary.base} />,
      };

    case "COMPLETED":
      return {
        title: "Rezerwacja zakończona",
        description: `Odebrałeś ${qty} za ${price}.`,
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
        description: `Otrzymano złoszenie o problemie dotyczącym tej oferty. Skontaktuj się z wystawiającym aby rozwiązać sprawę.`,
        icon: <AlertCircle size={18} color={colors.status.error} />,
      };
  }
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
