import React from "react";
import { useMachineReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import PreviewOrEditReview from "./preview-or-edit-review";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/src/theme";

interface MachineReviewCheckProps {
  machineId: number;
  isDefaultExpanded?: boolean;
}
export default function HasAddedMachineReview({
  machineId,
  isDefaultExpanded = false,
}: MachineReviewCheckProps) {
  const { data } = useMachineReviewCheck(machineId);
  const isReviewed = data?.alreadyReviewed ?? false;
  const existingReview = data?.review ?? null;

  if (isReviewed && existingReview) {
    return (
      <TitleAndReviewWrapper>
        <PreviewOrEditReview
          type="machine"
          machineId={machineId}
          existingReview={existingReview}
        />
      </TitleAndReviewWrapper>
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

//helper
function TitleAndReviewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionTitle}
      >
        Twoja opinia
      </Animated.Text>
      {children}
    </View>
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
