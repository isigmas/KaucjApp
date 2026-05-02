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

export default function CourierCard() {
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

  return (
    <SectionCard>
      <View style={styles.titleRow}>
        <Truck size={16} color={colors.accent.base} />
        <Text style={styles.sectionTitle}>Kto odbiera tę ofertę?</Text>
      </View>

      <View style={styles.courierRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{MOCK_COURIER.initials}</Text>
        </View>

        <View style={styles.courierInfo}>
          <Text style={styles.courierName}>{MOCK_COURIER.name}</Text>
          <View style={styles.metaRow}>
            <Star
              size={12}
              color={colors.status.warning}
              fill={colors.status.warning}
            />
            <Text style={styles.metaText}>
              {MOCK_COURIER.rating.toFixed(1)} · {MOCK_COURIER.completedOrders}{" "}
              odbiorów
            </Text>
          </View>
          <Text style={styles.metaSub}>
            Kurier od {MOCK_COURIER.joinedYear}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonSecondary,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Phone size={16} color={colors.accent.base} />
          <Text style={styles.actionButtonSecondaryText}>Zadzwoń</Text>
        </Pressable>

        <Pressable
          onPress={handleMessage}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonPrimary,
            pressed && styles.actionButtonPrimaryPressed,
          ]}
        >
          <MessageCircle size={16} color={colors.text.white} />
          <Text style={styles.actionButtonPrimaryText}>Napisz</Text>
        </Pressable>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.accent.base,
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.accent.base,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.accent.dark,
  },
  courierInfo: {
    flex: 1,
    gap: 3,
  },
  courierName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  metaSub: {
    fontSize: 12,
    color: colors.text.muted,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: rounded.lg,
  },
  actionButtonSecondary: {
    borderWidth: 1.5,
    borderColor: colors.accent.base,
    backgroundColor: colors.background.card,
  },
  actionButtonPressed: {
    backgroundColor: colors.accent.light,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent.base,
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent.base,
    shadowColor: colors.accent.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonPrimaryPressed: {
    backgroundColor: colors.accent.dark,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.white,
  },
});
