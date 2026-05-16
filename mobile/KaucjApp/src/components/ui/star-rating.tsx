import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme";
import { getPolishRatingCount } from "@/src/lib";
import { StyleSheet } from "react-native";
import { Rating } from "@/src/types";

interface StarRatingProps {
  rating: Rating | undefined;
}

export default function StarRating({ rating }: StarRatingProps) {
  if (!rating) return null;
  const hasRating = rating.feedbackCount > 0;

  return (
    <View style={styles.ratingContainer}>
      {hasRating ? (
        <>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.round(rating.avgScore) ? "star" : "star-outline"
                }
                size={16}
                color={colors.status.warning}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating.avgScore}{" "}
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
