import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useMyReservedOffers } from "@/src/api/hooks/use-offer";
import OfferItemsCard from "@/src/components/map/details/offer/offer-items-card";
import { OfferSummaryCard } from "@/src/components/map/details/offer/offer-summary-card";
import PickupCard from "@/src/components/map/details/offer/pickup-card";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { colors, spacing } from "@/src/theme";

import BookingActions from "./booking-actions";
import Countdown from "./countdown";
import MiniMap from "./mini-map";
import BookingStatusSummaryCard from "./booking-status-summary-card";
import ContactCard from "../../ui/contact-card";

interface BookingDetailsScreenProps {
  offerId: number;
}

export default function BookingDetailsScreen({
  offerId,
}: BookingDetailsScreenProps) {
  const {
    data: offers,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyReservedOffers();

  if (isLoading) {
    return <LoadingState title="Ładowanie rezerwacji" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Nie udało się załadować rezerwacji"
        message={error?.response?.data?.message || "Spróbuj ponownie."}
        onRetry={refetch}
      />
    );
  }

  //TODO: This screen should fetch /reserved/${offerId} to get the offer details
  const offer = offers?.find((o) => o.offer_id === offerId);

  if (!offer) {
    return (
      <EmptyState
        title="Ta rezerwacja jest już niedostępna."
        onRefresh={refetch}
      />
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <BookingStatusSummaryCard offer={offer} />

      <ContactCard userId={offer.creator_id} header="Wystawiający" />

      <MiniMap
        interactive={true}
        latitude={offer.latitude}
        longitude={offer.longitude}
        height={180}
        style={styles.map}
      />
      <PickupCard
        address={offer.pickup_address}
        instructions={offer.pickup_instructions}
      />

      <OfferItemsCard offer={offer} />

      <OfferSummaryCard offer={offer} />

      <BookingActions offerId={offer.offer_id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  countdownWrapper: {
    marginBottom: spacing.lg,
  },
  map: {
    marginBottom: spacing.lg,
  },
});
