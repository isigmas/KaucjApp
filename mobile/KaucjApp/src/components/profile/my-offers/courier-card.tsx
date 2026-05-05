import SectionCard from "@/src/components/map/details/section-card";
import { colors, rounded, spacing } from "@/src/theme";
import { MessageCircle, Phone, Star, Truck } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

const MOCK_COURIER = {
  name: "Michał Kowalski",
  phone: "+48 600 123 456",
  rating: 4.8,
  completedOrders: 142,
  initials: "MK",
  joinedYear: 2023,
};

interface CourierCardProps {
  asCard?: boolean;
}

export default function CourierCard({ asCard = true }: CourierCardProps) {
  const handleCall = () => {
    Alert.alert(
      "Wkrótce",
      "Funkcja połączenia z kurierem będzie dostępna już niedługo.",
    );
  };

  const handleMessage = () => {
    Alert.alert(
      "Wkrótce",
      "Funkcja wiadomości do kuriera będzie dostępna już niedługo.",
    );
  };
  const body = (
    <>
      <Text style={styles.sectionLabel}>Kto odbiera tę ofertę?</Text>

      <View style={styles.courierRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{MOCK_COURIER.initials}</Text>
        </View>

        <View style={styles.courierInfo}>
          <Text style={styles.courierName}>{MOCK_COURIER.name}</Text>
          <View style={styles.ratingRow}>
            <Star
              size={12}
              color={colors.status.warning}
              fill={colors.status.warning}
            />
            <Text style={styles.ratingText}>
              {MOCK_COURIER.rating.toFixed(1)} · {MOCK_COURIER.completedOrders}{" "}
              odbiorów
            </Text>
          </View>
          <Text style={styles.courierSince}>
            Kurier od {MOCK_COURIER.joinedYear}
          </Text>
        </View>
      </View>

      <View style={styles.courierActions}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnOutline,
            pressed && styles.actionBtnOutlinePressed,
          ]}
        >
          <Phone size={15} color={colors.accent.base} strokeWidth={2.2} />
          <Text style={styles.actionBtnOutlineLabel}>Zadzwoń</Text>
        </Pressable>

        <Pressable
          onPress={handleMessage}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnFill,
            pressed && styles.actionBtnFillPressed,
          ]}
        >
          <MessageCircle
            size={15}
            color={colors.text.white}
            strokeWidth={2.2}
          />
          <Text style={styles.actionBtnFillLabel}>Napisz</Text>
        </Pressable>
      </View>
    </>
  );
  if (!asCard) {
    return <View style={styles.courierSection}>{body}</View>;
  }

  return <SectionCard>{body}</SectionCard>;
}

const styles = StyleSheet.create({
  courierSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: rounded.pill,
    backgroundColor: colors.accent.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.accent.base + "60",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.accent.dark,
    letterSpacing: 0.5,
  },
  courierInfo: {
    flex: 1,
    gap: 2,
  },
  courierName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  courierSince: {
    fontSize: 12,
    color: colors.text.muted,
  },

  // Action buttons
  courierActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: rounded.lg,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: colors.accent.base,
    backgroundColor: colors.background.card,
  },
  actionBtnOutlinePressed: {
    backgroundColor: colors.accent.light,
  },
  actionBtnOutlineLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent.base,
  },
  actionBtnFill: {
    backgroundColor: colors.accent.base,
    shadowColor: colors.accent.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnFillPressed: {
    backgroundColor: colors.accent.dark,
  },
  actionBtnFillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.white,
  },
});
