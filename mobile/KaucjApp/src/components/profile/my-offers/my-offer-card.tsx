import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import Animated, { Layout, FadeOut, FadeInLeft } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import { Offer } from "@/src/types";
import { formatDate } from "@/src/lib";

interface OfferCardProps {
  offer: Offer;
  index: number;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function OfferCard({
  offer,
  index,
  onComplete,
  onCancel,
}: OfferCardProps) {
  const isOpen = offer.status === "OPEN";

  const handleComplete = () => {
    Alert.alert(
      "Potwierdzenie",
      "Czy na pewno chcesz oznaczyć tę ofertę jako zakończoną? Oznacza to, że kurier odebrał już opakowania.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Zakończ",
          style: "destructive",
          onPress: () => onComplete(offer.offer_id),
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Potwierdzenie",
      "Czy na pewno chcesz anulować tę ofertę? Oznacza to, że oferta nie będzie widoczna.",
      [
        { text: "Wróć", style: "cancel" },
        {
          text: "Potwierdź",
          style: "destructive",
          onPress: () => onCancel(offer.offer_id),
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
      style={[styles.card, !isOpen && styles.cardCompleted]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View
          style={[styles.statusBadge, !isOpen && styles.statusBadgeCompleted]}
        >
          <View
            style={[styles.statusDot, !isOpen && styles.statusDotCompleted]}
          />
          <Text
            style={[styles.statusText, !isOpen && styles.statusTextCompleted]}
          >
            {isOpen ? "Aktywna" : "Zakończona"}
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
          {offer.plastic_quantity > 0 && (
            <View key="plastic" style={styles.itemPill}>
              <Text style={styles.itemIcon}>Plastiki</Text>
              <Text style={styles.itemQuantity}>{offer.plastic_quantity}x</Text>
            </View>
          )}
          {offer.can_quantity > 0 && (
            <View key="cans" style={styles.itemPill}>
              <Text style={styles.itemIcon}>Puszki</Text>
              <Text style={styles.itemQuantity}>{offer.can_quantity}x</Text>
            </View>
          )}
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Ilość</Text>
            <Text style={styles.summaryValue}>{offer.total_quantity} szt.</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Otrzymasz</Text>
            <Text style={styles.summaryValueHighlight}>
              {offer.total_prize.toFixed(2)} zł
            </Text>
          </View>
        </View>
      </View>

      {isOpen && (
        <Animated.View exiting={FadeOut} style={styles.cardFooter}>
          <Pressable style={styles.completeButton} onPress={handleCancel}>
            <Ionicons name="close" size={20} color={colors.text.white} />
            <Text style={styles.completeButtonText}>Anuluj ofertę</Text>
          </Pressable>
        </Animated.View>
      )}
      {!isOpen && (
        <Animated.View exiting={FadeOut} style={styles.cardFooter}>
          <Pressable style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="close" size={20} color={colors.text.white} />
            <Text style={styles.completeButtonText}>
              Oznacz jako zakończoną
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
