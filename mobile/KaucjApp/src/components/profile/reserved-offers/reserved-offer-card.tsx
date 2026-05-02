import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import { useRouter } from "expo-router";
import { ChevronRight, Package, Wallet } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Countdown from "./countdown";
import MiniMap from "./mini-map";

interface ReservedOfferCardProps {
  offer: Offer;
}

export default function ReservedOfferCard({ offer }: ReservedOfferCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/profile/bookings/[id]",
      params: { id: offer.offer_id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: colors.primary.light }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <MiniMap
        latitude={offer.latitude}
        longitude={offer.longitude}
        height={140}
        style={styles.map}
      />

      <View style={styles.body}>
        <View style={styles.timerRow}>
          {offer.reserved_to ? (
            <Countdown expiresAt={offer.reserved_to} interval="minutes" />
          ) : null}
          <ChevronRight size={20} color={colors.text.muted} />
        </View>

        <View style={styles.statsRow}>
          <Stat
            icon={<Package size={16} color={colors.text.secondary} />}
            label="Opakowania"
            value={`${offer.total_quantity} szt.`}
          />
          <View style={styles.statDivider} />
          <Stat
            icon={<Wallet size={16} color={colors.primary.dark} />}
            label="Zarobisz"
            value={`+${offer.total_income.toFixed(2)} zł`}
            highlight
          />
        </View>
      </View>
    </Pressable>
  );
}

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function Stat({ icon, label, value, highlight }: StatProps) {
  return (
    <View style={styles.stat}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    borderWidth: 1,
    borderColor: colors.status.border,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  map: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.border,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  stat: {
    flex: 1,
    gap: 4,
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statValueHighlight: {
    color: colors.primary.base,
    fontWeight: "800",
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.status.border,
    marginHorizontal: spacing.md,
  },
});
