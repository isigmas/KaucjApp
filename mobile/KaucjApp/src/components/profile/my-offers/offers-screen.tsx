import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";

import { colors } from "@/src/theme";
import { useRouter } from "expo-router";
import { useChangeOfferStatus, useMyOffers } from "@/src/api/hooks/use-offer";
import OfferCard from "./my-offer-card";
import EmptyState from "@/src/components/states/empty-state";
import LoadingState from "@/src/components/states/loading-state";
import ErrorState from "@/src/components/states/error-state";

export default function MyOffers() {
  const {
    data: offers,
    isPending: isOfferPending,
    isError,
    error,
    refetch,
  } = useMyOffers();

  const { mutate: changeOfferStatus, isPending: isChangeStatusPending } =
    useChangeOfferStatus();

  const isPending = isOfferPending || isChangeStatusPending;

  const router = useRouter();

  const markAsCompleted = (offerId: number) => {
    console.log("Marking offer as completed, id: ", offerId);

    changeOfferStatus(
      { offerId, newStatus: "COMPLETED" },
      {
        onSuccess: () => {
          router.push("/profile/offers/confirmation");
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || "Nie udało się zakończyć oferty.";
          Alert.alert("Błąd", errorMessage);
        },
      },
    );
  };

  const markAsCanceled = (offerId: number) => {
    console.log("Marking offer as canceled, id: ", offerId);

    changeOfferStatus(
      { offerId, newStatus: "CANCELED" },
      {
        onSuccess: () => {
          router.push("/profile/offers/confirmation");
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || "Nie udało się zakończyć oferty.";
          Alert.alert("Błąd", errorMessage);
        },
      },
    );
  };

  if (isPending) return <LoadingState title="Ładowanie twoich ofert" />;
  if (isError)
    return (
      <ErrorState
        title="Ops! coś poszło nie tak podczas ładowania twoich ofert."
        message={error.message}
        onRetry={refetch}
      />
    );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior={"automatic"}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {offers.length === 0 && (
        <EmptyState title="Nie masz jeszcze zadnych ofert." />
      )}

      <View style={styles.listContainer}>
        {offers.map((offer, index) => (
          <OfferCard
            key={offer.offer_id}
            offer={offer}
            index={index}
            onComplete={markAsCompleted}
            onCancel={markAsCanceled}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 16,
  },
});
