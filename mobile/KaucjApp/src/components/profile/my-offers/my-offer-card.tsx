import { formatDate, getOfferStatusConfig } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin, Package, Wallet } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MyOfferCardProps {
  offer: Offer;
}

export default function MyOfferCard({ offer }: MyOfferCardProps) {
  const router = useRouter();
  const { color, label } = getOfferStatusConfig(offer.status);

  const handlePress = () => {
    router.push({
      pathname: "/profile/offers/[id]",
      params: { id: offer.offer_id },
    });
  };

  const pillLabel = () => {
    if (offer.status === "OPEN") {
      return `${label} ${formatDate(offer.created_at)}`;
    } else if (offer.status === "RESERVED" && offer.reserved_at) {
      return `${label} ${formatDate(offer.reserved_at)}`;
    }
    return label;
  };

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: colors.primary.light }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={[styles.statusPill, { backgroundColor: color + "22" }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={[styles.statusText, { color }]}>{pillLabel()}</Text>
          </View>
          <View style={styles.headerRight}>
            <ChevronRight size={16} color={colors.text.muted} />
          </View>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={14} color={colors.text.secondary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {offer.pickup_address}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatItem
            icon={<Package size={16} color={colors.text.secondary} />}
            label="Opakowania"
            value={`${offer.total_quantity} szt.`}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon={<Wallet size={16} color={colors.primary.dark} />}
            label="Należność"
            value={`${offer.total_prize.toFixed(2)} zł`}
            highlight
          />
        </View>
      </View>
    </Pressable>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ icon, label, value, highlight }: StatItemProps) {
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
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  reservedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  reservedText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.accent.base,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
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
