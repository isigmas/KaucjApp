import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme";
import { getPolishRatingCount } from "@/src/lib";
import { Rating } from "@/src/types";

interface StarRatingProps {
  rating: Rating | undefined;
}

export default function StarRating({ rating }: StarRatingProps) {
  if (!rating) return null;
  const hasRating = rating.feedbackCount > 0;

  const renderStar = (index: number) => {
    const fillValue = Math.max(0, Math.min(1, rating.avgScore - index));
    return (
      <View key={index} style={styles.starWrapper}>
        <Ionicons name="star-outline" size={16} color={colors.status.warning} />

        {fillValue > 0 && (
          <View
            style={[styles.filledStarOverlay, { width: `${fillValue * 100}%` }]}
          >
            <Ionicons name="star" size={16} color={colors.status.warning} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.ratingContainer}>
      {hasRating ? (
        <>
          <View style={styles.starsRow}>{[0, 1, 2, 3, 4].map(renderStar)}</View>
          <Text style={styles.ratingText}>
            {rating.avgScore.toFixed(1)}{" "}
            <Text style={styles.ratingCount}>
              ({getPolishRatingCount(rating.feedbackCount)})
            </Text>
          </Text>
        </>
      ) : (
        <Text style={styles.ratingCount}>Brak opinii</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  starWrapper: {
    position: "relative",
  },
  filledStarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    overflow: "hidden",
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingCount: {
    fontWeight: "400",
    color: colors.text.secondary,
  },
});
