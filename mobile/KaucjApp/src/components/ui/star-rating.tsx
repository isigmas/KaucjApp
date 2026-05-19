import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme";
import { getPolishRatingCount } from "@/src/lib";
import { Rating } from "@/src/types";

interface StarRatingProps {
  rating: Rating | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function StarRating({
  rating,
  size = 16,
  style,
}: StarRatingProps) {
  if (!rating) return null;
  const hasRating = rating.feedbackCount > 0;

  const renderStar = (index: number) => {
    const fillValue = Math.max(0, Math.min(1, rating.avgScore - index));
    return (
      <View key={index} style={styles.starWrapper}>
        <Ionicons
          name="star-outline"
          size={size}
          color={colors.status.warning}
        />

        {fillValue > 0 && (
          <View
            style={[styles.filledStarOverlay, { width: `${fillValue * 100}%` }]}
          >
            <Ionicons name="star" size={size} color={colors.status.warning} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.ratingContainer, style]}>
      {hasRating ? (
        <>
          <View style={styles.starsRow}>{[0, 1, 2, 3, 4].map(renderStar)}</View>
          <Text style={[styles.ratingText, { fontSize: size - 1 }]}>
            {rating.avgScore.toFixed(1)}{" "}
            <Text style={styles.ratingCount}>
              ({getPolishRatingCount(rating.feedbackCount)})
            </Text>
          </Text>
        </>
      ) : (
        <Text style={[styles.ratingCount, { fontSize: size - 1 }]}>
          Brak opinii
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm + 3,
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
