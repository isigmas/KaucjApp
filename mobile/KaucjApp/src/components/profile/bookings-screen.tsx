import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Package, CheckCircle, Star } from "lucide-react-native";
import { colors } from "@/src/theme";
import {
  getErrorMessage,
  type OfferDTO,
  useCompleteOffer,
  useRateUser,
  useReservedOffers,
} from "@/src/api/hooks/use-offer";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const [ratingModal, setRatingModal] = useState<{ creatorId: number } | null>(
    null,
  );
  const [ratingScore, setRatingScore] = useState(5);

  const {
    data: offers = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useReservedOffers();
  const completeOfferMutation = useCompleteOffer();
  const rateUserMutation = useRateUser();

  const totalEarnings = useMemo(
    () =>
      offers.reduce(
        (sum, offer) =>
          sum +
          offer.items.reduce(
            (itemSum, item) => itemSum + item.unit_price * item.quantity,
            0,
          ),
        0,
      ),
    [offers],
  );

  const handleComplete = async (offer: OfferDTO) => {
    try {
      await completeOfferMutation.mutateAsync(offer.offer_id);
      setRatingScore(5);
      setRatingModal({ creatorId: offer.creator_id });
    } catch {
      // Mutation error is handled from completeOfferMutation.error
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingModal) return;
    try {
      await rateUserMutation.mutateAsync({
        userId: ratingModal.creatorId,
        payload: { score: ratingScore },
      });
    } catch {
      // Rating is optional, do not block flow.
    } finally {
      setRatingModal(null);
    }
  };

  const completionError = completeOfferMutation.error
    ? getErrorMessage(completeOfferMutation.error)
    : null;
  const queryError = error && offers.length === 0 ? getErrorMessage(error) : null;
  const resolvedError = completionError || queryError;

  const renderItem = ({ item }: { item: OfferDTO }) => {
    const earnings = item.items.reduce(
      (sum, row) => sum + row.unit_price * row.quantity,
      0,
    );
    const totalQty = item.items.reduce((sum, row) => sum + row.quantity, 0);
    const isCompleting =
      completeOfferMutation.isPending &&
      completeOfferMutation.variables === item.offer_id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.primary.base} />
            <Text style={styles.address} numberOfLines={2}>
              {item.pickup_address}
            </Text>
          </View>
          <Text style={styles.earnings}>+{earnings.toFixed(2)} zł</Text>
        </View>

        {item.pickup_instructions ? (
          <Text style={styles.pickupInfo} numberOfLines={2}>
            {item.pickup_instructions}
          </Text>
        ) : null}

        <View style={styles.itemsList}>
          {item.items.map((row, idx) => (
            <View key={`${item.offer_id}-${idx}`} style={styles.itemRow}>
              <Package size={14} color={colors.text.secondary} />
              <Text style={styles.itemText}>
                {row.bottle_name} × {row.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                +{(row.unit_price * row.quantity).toFixed(2)} zł
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalQty}>{totalQty} szt.</Text>
          <Text style={styles.creatorLabel}>wystawiający ID: {item.creator_id}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            pressed && styles.completeButtonPressed,
            isCompleting && styles.completeButtonDisabled,
          ]}
          onPress={() => handleComplete(item)}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <>
              <CheckCircle size={18} color={colors.text.white} />
              <Text style={styles.completeButtonText}>Potwierdź odbiór</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.base} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={ratingModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Jak było?</Text>
            <Text style={styles.modalSubtitle}>Oceń wystawiającego ofertę</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((score) => (
                <Pressable
                  key={score}
                  onPress={() => setRatingScore(score)}
                  style={styles.starButton}
                >
                  <Star
                    size={36}
                    color={colors.status.warning}
                    fill={score <= ratingScore ? colors.status.warning : "transparent"}
                  />
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.skipButton}
                onPress={() => setRatingModal(null)}
              >
                <Text style={styles.skipText}>Pomiń</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.rateButton,
                  rateUserMutation.isPending && styles.rateButtonDisabled,
                ]}
                onPress={handleSubmitRating}
                disabled={rateUserMutation.isPending}
              >
                {rateUserMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.text.white} />
                ) : (
                  <Text style={styles.rateText}>Oceń</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {offers.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {offers.length}{" "}
            {offers.length === 1
              ? "rezerwacja"
              : offers.length < 5
                ? "rezerwacje"
                : "rezerwacji"}
          </Text>
          <Text style={styles.summaryEarnings}>
            Zarobisz: {totalEarnings.toFixed(2)} zł
          </Text>
        </View>
      )}

      {resolvedError && offers.length > 0 ? (
        <View style={styles.inlineErrorBar}>
          <Text style={styles.inlineErrorText}>{resolvedError}</Text>
        </View>
      ) : null}

      {resolvedError && offers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{resolvedError}</Text>
          <Pressable
            onPress={() => {
              completeOfferMutation.reset();
              void refetch();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.center}>
          <Package size={48} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>Brak rezerwacji</Text>
          <Text style={styles.emptySubtitle}>
            Zarezerwowane oferty pojawią się tutaj
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.offer_id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => void refetch()}
              tintColor={colors.primary.base}
              colors={[colors.primary.base]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary.light,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  summaryEarnings: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  inlineErrorBar: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  inlineErrorText: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  address: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  earnings: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.base,
  },
  pickupInfo: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 10,
    paddingLeft: 22,
  },
  itemsList: {
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  totalQty: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  creatorLabel: {
    fontSize: 13,
    color: colors.text.muted,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary.base,
    borderRadius: 12,
    paddingVertical: 14,
  },
  completeButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary.base,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.white,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: -8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  starButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    width: "100%",
  },
  skipButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  rateButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.base,
  },
  rateButtonDisabled: {
    opacity: 0.7,
  },
  rateText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.white,
  },
});
