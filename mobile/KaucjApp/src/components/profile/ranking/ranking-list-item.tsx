import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { UserStats, RankingActivityType } from "@/src/types/ranking";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import RankingAvatar from "./ranking-avatar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface RankingListItemProps {
  user: UserStats;
  rank: number;
  type: RankingActivityType;
}

export default function RankingListItem({
  user,
  rank,
  type,
}: RankingListItemProps) {
  const router = useRouter();
  const score = type.includes("returned")
    ? user.returnedTotalCount
    : user.collectedTotalCount;

  // Calculate delay up to a max so the list doesn't take forever to animate in
  const animationDelay = Math.min((rank - 3) * 100, 800);

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).springify()}
      style={styles.card}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/profile/stats",
            params: { userId: user.userId },
          })
        }
      >
        <RankingAvatar imageUrl={user.profilePictureUrl} size={48} />
      </Pressable>

      <View style={styles.userInfo}>
        <Text style={styles.username} numberOfLines={1}>
          {user.username}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score}</Text>
        <Ionicons name="leaf" size={16} color={colors.primary.base} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    ...shadows.light,
  },
  rankContainer: {
    width: 32,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.muted,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.pill,
    gap: 6,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary.dark,
  },
});
