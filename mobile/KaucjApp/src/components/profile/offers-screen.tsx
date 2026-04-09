import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import Animated, { Layout, FadeOut, FadeInLeft } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import {
  getErrorMessage,
  type OfferDTO,
  useCancelOffer,
  useMyOffers,
} from "@/src/api/hooks/use-offer";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OfferCard = ({
  offer,
  index,
  onCancel,
  isCancelling,
}: {
  offer: OfferDTO;
  index: number;
  onCancel: (offer: OfferDTO) => void;
  isCancelling: boolean;
}) => {
  const canCancel = offer.status === "OPEN" || offer.status === "RESERVED";
  const statusLabel: Record<OfferDTO["status"], string> = {
    OPEN: "Aktywna",
    RESERVED: "Zarezerwowana",
    COMPLETED: "Zakończona",
    CANCELED: "Anulowana",
  };
  const isInactive = offer.status === "COMPLETED" || offer.status === "CANCELED";

  const totalItems = offer.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPayout = offer.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const handleCancel = () => {
    Alert.alert(
      "Potwierdzenie",
      "Czy na pewno chcesz anulować tę ofertę?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Anuluj ofertę",
          style: "destructive",
          onPress: () => onCancel(offer),
        },
      ],
    );
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 150)
        .springify()
        .damping(50)
        .stiffness(500)
        .mass(2.5)}
      layout={Layout.springify()}
      style={[styles.card, isInactive && styles.cardCompleted]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View
          style={[styles.statusBadge, isInactive && styles.statusBadgeCompleted]}
        >
          <View
            style={[styles.statusDot, isInactive && styles.statusDotCompleted]}
          />
          <Text
            style={[styles.statusText, isInactive && styles.statusTextCompleted]}
          >
            {statusLabel[offer.status]}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(offer.created_at)}</Text>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color={colors.text.secondary}
          />
          <Text style={styles.addressText}>{offer.pickup_address}</Text>
        </View>

        <View style={styles.itemsRow}>
          {offer.items.map((item) => {
            return (
              <View key={`${offer.offer_id}-${item.bottle_id}`} style={styles.itemPill}>
                <Text style={styles.itemIcon}>{item.bottle_name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              </View>
            );
          })}
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Ilość</Text>
            <Text style={styles.summaryValue}>{totalItems} szt.</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Otrzymasz</Text>
            <Text style={styles.summaryValueHighlight}>
              {totalPayout.toFixed(2)} zł
            </Text>
          </View>
        </View>
      </View>

      {canCancel && (
        <Animated.View exiting={FadeOut} style={styles.cardFooter}>
          <Pressable
            style={[styles.completeButton, isCancelling && styles.completeButtonDisabled]}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Text style={styles.completeButtonText}>Anulowanie...</Text>
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={colors.text.white}
                />
                <Text style={styles.completeButtonText}>Anuluj ofertę</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
};

// --- Main Screen ---
export default function MyOffers() {
  const { data: offers = [], isPending, isError, error } = useMyOffers();
  const cancelOfferMutation = useCancelOffer();

  if (isPending) return <Text>Loading...</Text>;
  if (isError) return <Text>{getErrorMessage(error)}</Text>;

  const markAsCanceled = async (offer: OfferDTO) => {
    try {
      await cancelOfferMutation.mutateAsync(offer.offer_id);
    } catch {
      // Error rendered below from mutation state.
    }
  };

  const mutationError = cancelOfferMutation.error
    ? getErrorMessage(cancelOfferMutation.error)
    : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior={"automatic"}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.listContainer}>
        {mutationError ? (
          <Text style={styles.errorBanner}>{mutationError}</Text>
        ) : null}
        {offers.map((offer, index) => (
          <OfferCard
            key={offer.offer_id}
            offer={offer}
            index={index}
            onCancel={markAsCanceled}
            isCancelling={
              cancelOfferMutation.isPending &&
              cancelOfferMutation.variables === offer.offer_id
            }
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
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBanner: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
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
