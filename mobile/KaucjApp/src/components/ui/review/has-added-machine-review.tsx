import { View, StyleSheet } from "react-native";
import React from "react";
import { useMachineReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors, spacing } from "@/src/theme";
import ReviewCard from "./review-list-card";
import Animated, { FadeInDown } from "react-native-reanimated";

interface MachineReviewCheckProps {
  machineId: number;
  isDefaultExpanded?: boolean;
}
export default function HasAddedMachineReview({
  machineId,
  isDefaultExpanded = false,
}: MachineReviewCheckProps) {
  const { data, isLoading } = useMachineReviewCheck(machineId);
  const existingReview = data?.review ?? null;

  if (isLoading) {
    return null;
  }

  if (existingReview) {
    return (
      <View style={styles.container}>
        <Animated.Text
          entering={FadeInDown.delay(300).springify()}
          style={styles.sectionTitle}
        >
          Twoja opinia
        </Animated.Text>
        <ReviewCard
          review={existingReview}
          key={existingReview.reviewId}
          isEditable={true}
        />
      </View>
    );
  }

  return (
    <ExpandableReview
      type="machine"
      machineId={machineId}
      isDefaultExpanded={isDefaultExpanded}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
