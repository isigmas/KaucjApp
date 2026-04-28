import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { colors, spacing } from "@/src/theme";
import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";
import DetailHeader from "../../details-header";
import OfferReviewCard from "./offer-review-card";
import EarningsSummary from "./earnings-summary";
import SwipeToReserve from "./swipe-to-reserve";
import ReservationSuccess from "./reservation-success";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";

export default function BookingScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const offer = params.offerData
    ? JSON.parse(params.offerData as string)
    : null;

  const [reserved, setReserved] = useState(false);
  const { mutate: changeOfferStatus, isPending } = useChangeOfferStatus();

  const headerHeight = useHeaderHeight();

  const handleSwipeComplete = () => {
    // changeOfferStatus(
    //   { offerId: offer.offer_id, newStatus: "RESERVED" },
    //   {
    //     onSuccess: () => setReserved(true),
    //     onError: (error) => {
    //       const message =
    //         error.response?.data?.message ??
    //         "Nie udało się zarezerwować oferty.";
    //       Alert.alert("Błąd", message);
    //     },
    //   },
    // );
    setReserved(true);
  };

  if (reserved) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: headerHeight + spacing.sm,
          },
        ]}
      >
        <ReservationSuccess
          offer={offer}
          onDone={() => router.push("/(app)/(tabs)/profile/bookings")}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: headerHeight + spacing.sm,
        },
      ]}
    >
      <DetailHeader
        title="Gotowy do rezerwacji?"
        subtitle="Sprawdź szczegóły i potwierdź rezerwację"
      />

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <OfferReviewCard offer={offer} />
        <EarningsSummary
          totalPrize={offer.total_prize}
          totalIncome={offer.total_income}
          totalQuantity={offer.total_quantity}
        />
      </ScrollView>

      <View style={styles.footer}>
        <SwipeToReserve onComplete={handleSwipeComplete} disabled={isPending} />
        <Text style={styles.hint}>
          Twoja rezerwacja jest bezpieczna i możliwa do anulowania
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  scrollArea: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
