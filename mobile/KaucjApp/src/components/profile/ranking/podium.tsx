import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { UserStats, RankingActivityType } from "@/src/types/ranking";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import RankingAvatar from "./ranking-avatar";
import { Ionicons } from "@expo/vector-icons";

interface PodiumProps {
  topUsers: UserStats[];
  type: RankingActivityType;
}

export default function Podium({ topUsers, type }: PodiumProps) {
  // Reorder for visual hierarchy: [2nd, 1st, 3rd]
  const podiumOrder = [topUsers[1], topUsers[0], topUsers[2]].filter(Boolean);

  // Mapping the original rank based on the reordered array
  const getOriginalRank = (index: number) =>
    index === 0 ? 2 : index === 1 ? 1 : 3;

  const getScore = (user: UserStats) =>
    type.includes("returned")
      ? user.returnedTotalCount
      : user.collectedTotalCount;

  return (
    <View style={styles.container}>
      {podiumOrder.map((user, index) => {
        const rank = getOriginalRank(index);
        const isFirst = rank === 1;
        const delay = isFirst ? 200 : rank === 2 ? 300 : 400;

        return (
          <Animated.View
            key={user.userId}
            entering={FadeInUp.delay(delay).springify()}
            style={[styles.podiumItem, isFirst && styles.firstPlaceItem]}
          >
            <Animated.View entering={ZoomIn.delay(delay + 100).springify()}>
              <RankingAvatar
                imageUrl={user.profilePictureUrl}
                size={isFirst ? 80 : 64}
                rank={rank}
              />
            </Animated.View>

            <View style={styles.infoContainer}>
              <Text
                style={[styles.username, isFirst && styles.firstPlaceUsername]}
                numberOfLines={1}
              >
                {user.username}
              </Text>
              <View style={styles.scoreBadge}>
                <Ionicons name="leaf" size={12} color={colors.primary.dark} />
                <Text style={styles.scoreText}>{getScore(user)}</Text>
              </View>
              {isFirst && (
                <Text style={styles.scoreTextSecondary}>
                  {type.includes("returned")
                    ? "największa liczba wystawionych opakowań PET"
                    : "największa liczba odebranych opakowań PET"}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 220,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  podiumItem: {
    alignItems: "center",
    width: "30%",
    paddingBottom: spacing.md,
  },
  firstPlaceItem: {
    width: "35%",
    paddingBottom: spacing.lg,
    zIndex: 10,
  },
  infoContainer: {
    alignItems: "center",
    marginTop: spacing.sm,
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: rounded.xl,
    width: "100%",
    ...shadows.light,
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  firstPlaceUsername: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.primary,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.pill,
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  scoreTextSecondary: {
    marginTop: spacing.xs,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
