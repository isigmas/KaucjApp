import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Offer } from "@/src/types";
import { formatDate } from "@/src/lib";
import DetailHeader from "../details-header";
import StatusBadge from "./status-badge";
import OfferItemsCard from "./offer-items-card";
import PickupCard from "./pickup-card";
import { OfferSummaryCard } from "./offer-summary-card";
import ReserveOffer from "./reserve-offer";
import { useGetOffer } from "@/src/api/hooks/use-offer";
import LoadingState from "@/src/components/states/loading-state";
import EmptyState from "@/src/components/states/empty-state";
import { useAuth } from "@/src/auth/use-auth";
import SectionCard from "@/src/components/ui/section-card";
import { colors, rounded, spacing } from "@/src/theme";
import WarningBanner from "../warning-banner";

interface OfferDetailsProps {
  offer: Offer;
  offerId: number;
}

export default function OfferDetails({ offerId }: OfferDetailsProps) {
  const { user } = useAuth();
  const { data: offer, isLoading } = useGetOffer(offerId);
  if (isLoading) {
    return <LoadingState title="Ładowanie oferty" />;
  }
  if (!offer) {
    return <EmptyState title="Ta oferta jest już niedostępna." />;
  }

  const isReserved = offer.status === "RESERVED";
  const isTheUserOwner = offer.creatorId === user?.userId;
  return (
    <View style={styles.container}>
      <DetailHeader
        title="Szczegóły oferty"
        subtitle={formatDate(offer.createdAt)}
        rightSlot={<StatusBadge status={offer.status} />}
      />
      {isTheUserOwner && (
        <WarningBanner
          message="To jest twoja oferta"
          accentColor={colors.status.warning}
        />
      )}
      <OfferItemsCard offer={offer} />

      <PickupCard
        address={offer.pickupAddress}
        instructions={offer.pickupInstructions}
      />

      <OfferSummaryCard offer={offer} />

      {!isTheUserOwner && !isReserved && (
        <ReserveOffer offerId={offer.offerId} totalIncome={offer.totalIncome} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
});
