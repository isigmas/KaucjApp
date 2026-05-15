import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { colors, rounded, spacing } from "@/src/theme";
import { Star } from "lucide-react-native";
import { User } from "@/src/types/user";
import { getPolishPickupsCount, getPolishRatingCount } from "@/src/lib";

interface UserProfileInfoProps {
  user: User;
  rating: number;
  pickupsCount?: number;
  ratingCount?: number;
  courierFrom?: string;
}

export default function UserProfileInfo({
  user,
  rating,
  pickupsCount,
  ratingCount,
  courierFrom,
}: UserProfileInfoProps) {
  return (
    <View style={styles.courierRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.firstName.charAt(0)}
          {user.lastName.charAt(0)}
        </Text>
      </View>

      <View style={styles.courierInfo}>
        <Text style={styles.courierName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.courierUsername}>
          {courierFrom ? `kurier od ${courierFrom}` : user.username}
        </Text>
        <View style={styles.ratingRow}>
          <Star
            size={12}
            color={colors.status.warning}
            fill={colors.status.warning}
          />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)}
            {pickupsCount
              ? ` · ${getPolishPickupsCount(pickupsCount)}`
              : ratingCount && ` · ${getPolishRatingCount(ratingCount)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    textTransform: "uppercase",
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
  courierUsername: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
