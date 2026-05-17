import React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { useGetOffer } from "@/src/api/hooks/use-offer";
import OfferItemsCard from "@/src/components/map/details/offer/offer-items-card";
import { OfferSummaryCard } from "@/src/components/map/details/offer/offer-summary-card";
import PickupCard from "@/src/components/map/details/offer/pickup-card";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { colors, spacing } from "@/src/theme";

import BookingActions from "./booking-actions";

import BookingStatusSummaryCard from "./booking-status-summary-card";
import ContactCard from "../../ui/contact-card";

import ExpandableCard from "../../ui/expandable-card";
import { Package, Receipt } from "lucide-react-native";
import { useRouter } from "expo-router";

interface BookingDetailsScreenProps {
  offerId: number;
}

export default function BookingDetailsScreen({
  offerId,
}: BookingDetailsScreenProps) {
  const {
    data: offer,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetOffer(offerId);
  const router = useRouter();

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

  if (!offer) {
    return (
      <EmptyState
        title="Ta rezerwacja jest już niedostępna."
        onRefresh={refetch}
      />
    );
  }

  const handleOnUserProfileInfoPress = () => {
    router.push({
      pathname: "/profile/bookings/profile-details-sheet",
      params: { userId: offer.creatorId },
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary.base}
          colors={[colors.primary.base]}
          progressBackgroundColor={colors.background.main}
          progressViewOffset={10}
        />
      }
    >
      <BookingStatusSummaryCard offer={offer} />

      <ContactCard
        userId={offer.creatorId}
        header="Wystawiający"
        onUserProfileInfoPress={handleOnUserProfileInfoPress}
      />

      <PickupCard
        address={offer.pickupAddress}
        instructions={offer.pickupInstructions}
        showMap
        latitude={offer.latitude}
        longitude={offer.longitude}
      />

      <ExpandableCard
        title="Zawartość"
        subtitle={`${offer.totalQuantity} szt. · butelki i puszki`}
        icon={<Package size={18} color={colors.primary.dark} />}
        defaultExpanded={true}
      >
        <OfferItemsCard offer={offer} bare />
      </ExpandableCard>

      <ExpandableCard
        title="Finanse"
        subtitle={`Należność ${offer.totalPrize.toFixed(2).replace(".", ",")} zł`}
        icon={<Receipt size={18} color={colors.primary.dark} />}
        defaultExpanded
      >
        <OfferSummaryCard offer={offer} bare />
      </ExpandableCard>

      <BookingActions offerId={offer.offerId} offerStatus={offer.status} />
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
