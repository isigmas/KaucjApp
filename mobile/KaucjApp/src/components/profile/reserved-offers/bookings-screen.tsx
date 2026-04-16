import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useMyReservedOffers } from "@/src/api/hooks/use-offer";
import { colors, spacing, rounded } from "@/src/theme";
import ReservedOfferCard from "./reserved-offer-card";

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
    return <LoadingState />;
  }

  if (isError) {
    const message =
      error?.response?.data?.message || "Nie udało się pobrać rezerwacji.";
    return <ErrorState message={message} onRetry={refetch} />;
  }

  if (!offers || offers.length === 0) {
    return <EmptyState onRefresh={refetch} />;
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
        <ReservedOfferCard key={offer.offer_id.toString()} offer={offer} />
      ))}
    </ScrollView>
  );
}

function LoadingState() {
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={colors.primary.base} />
      <Text style={styles.loadingText}>Pobieranie rezerwacji...</Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.errorTitle}>Wystąpił błąd</Text>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyTitle}>Brak rezerwacji</Text>
      <Text style={styles.emptyText}>
        Nie masz jeszcze żadnych zarezerwowanych ofert.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Odśwież</Text>
      </TouchableOpacity>
    </View>
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.main,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.status.error,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: rounded.apple,
  },
  retryButtonText: {
    color: colors.text.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
