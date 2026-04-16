import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import { useRouter } from "expo-router";
import { useChangeOfferStatus, useMyOffers } from "@/src/api/hooks/use-offer";
import OfferCard from "./my-offer-card";

export default function MyOffers() {
  const { data: offers, isPending: isOfferPending } = useMyOffers();
  const { mutate: changeOfferStatus, isPending: isChangeStatusPending } =
    useChangeOfferStatus();

  const isPending = isOfferPending || isChangeStatusPending;

  const router = useRouter();

  if (isPending) return <Text>Loading...</Text>;
  if (!offers) return <Text>Error</Text>;

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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior={"automatic"}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.listContainer}>
        {offers.map((offer, index) => (
          <OfferCard
            key={offer.offer_id}
            offer={offer}
            index={index}
            onComplete={markAsCompleted}
          />
        ))}
      </View>

      {offers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="receipt-outline"
            size={48}
            color={colors.status.border}
          />
          <Text style={styles.emptyStateText}>
            Nie masz jeszcze żadnych ofert.
          </Text>
        </View>
      )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  listContainer: {
    gap: 16,
  },

  // Card Styles
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.status.border,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  cardCompleted: {
    backgroundColor: colors.background.main,
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.border,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: colors.background.subtle,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.base,
  },
  statusDotCompleted: {
    backgroundColor: colors.text.muted,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary.dark,
    textTransform: "uppercase",
  },
  statusTextCompleted: {
    color: colors.text.secondary,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  cardBody: {
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  itemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  itemPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.subtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.border,
    gap: 4,
  },
  itemIcon: {
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryBox: {
    flexDirection: "row",
    backgroundColor: colors.background.subtle,
    borderRadius: 12,
    padding: 12,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.status.border,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary.dark,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.base,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  completeButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    padding: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
