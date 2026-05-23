import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";
import StarRating from "../../ui/star-rating";

interface DetailHeaderProps {
  title: string;
  titleSize?: number;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  ratingScore?: number;
  feedbackCount?: number;
}

export default function DetailHeader({
  title,
  titleSize = 24,
  subtitle,
  rightSlot,
  ratingScore,
  feedbackCount,
}: DetailHeaderProps) {
  const showRating = ratingScore != undefined && feedbackCount != undefined;

  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {showRating && (
          <StarRating
            ratingScore={ratingScore}
            feedbackCount={feedbackCount}
            size={16}
            style={{ marginBottom: 0 }}
          />
        )}
      </View>

      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rightSlot: {
    position: "relative",
    zIndex: 10,
  },
});
