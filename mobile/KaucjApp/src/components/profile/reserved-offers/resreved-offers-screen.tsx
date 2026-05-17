import React from "react";
import { StyleSheet, RefreshControl, ScrollView } from "react-native";
import { useMyReservedOffers } from "@/src/api/hooks/use-offer";
import { colors, spacing, rounded } from "@/src/theme";
import ReservedOfferCard from "./reserved-offer-card";
import EmptyState from "@/src/components/states/empty-state";
import LoadingState from "@/src/components/states/loading-state";
import ErrorState from "@/src/components/states/error-state";

export default function ReservedOffersScreen() {
  const {
    data: offers,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMyReservedOffers();

  if (isLoading) {
    return <LoadingState title="Ładowanie twoich rezerwacji" />;
  }

  if (isError) {
    const message =
      error?.response?.data?.message || "Nie udało się pobrać rezerwacji.";
    return (
      <ErrorState
        title="Ops! coś poszło nie tak podczas ładowania twoich rezwerwacji"
        message={message}
        onRetry={refetch}
      />
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <EmptyState
        title="Obecnie nie rezerwujesz zadnych ofert."
        onRefresh={refetch}
      />
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary.base}
          colors={[colors.primary.base]}
        />
      }
    >
      {offers.map((offer) => (
        <ReservedOfferCard key={offer.offerId.toString()} offer={offer} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
