import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { spacing } from "@/src/theme";
import { ApiErrorResponse, Offer } from "@/src/types";
import { UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import MyOfferCard from "./my-offer-card";

export interface FallbackStates {
  loadingTitle: string;
  errorTitle: string;
  errorMessage: string;
  emptyTitle: string;
}

interface OffersListProps {
  query: UseQueryResult<Offer[], AxiosError<ApiErrorResponse>>;
  fallbackStates: FallbackStates;
}

export default function OffersList({ query, fallbackStates }: OffersListProps) {
  const { data: offers, isLoading, isError, error, refetch } = query;

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <LoadingState title={fallbackStates.loadingTitle} />
      </View>
    );
  }

  if (isError) {
    const message =
      error?.response?.data?.message || fallbackStates.errorMessage;
    return (
      <View style={styles.stateContainer}>
        <ErrorState
          title={fallbackStates.errorTitle}
          message={message}
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <EmptyState title={fallbackStates.emptyTitle} onRefresh={refetch} />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.list}>
      {offers.map((offer) => (
        <MyOfferCard key={offer.offerId.toString()} offer={offer} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    minHeight: 360,
  },
  list: {
    paddingTop: spacing.sm,
  },
});
