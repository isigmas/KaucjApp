import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { useMyOffers } from "@/src/api/hooks/use-offer";
import { colors, spacing } from "@/src/theme";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import MyOfferCard from "./my-offer-card";

export default function MyOffersScreen() {
  const {
    data: offers,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMyOffers();

  if (isLoading) {
    return <LoadingState title="Ładowanie twoich ofert" />;
  }

  if (isError) {
    const message =
      error?.response?.data?.message || "Nie udało się pobrać ofert.";
    return (
      <ErrorState
        title="Ops! coś poszło nie tak podczas ładowania twoich ofert"
        message={message}
        onRetry={refetch}
      />
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <EmptyState
        title="Nie masz jeszcze żadnych ofert."
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
        <MyOfferCard key={offer.offer_id.toString()} offer={offer} />
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
