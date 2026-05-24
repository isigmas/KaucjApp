import { View, Text, StyleSheet } from "react-native";
import React from "react";
import {
  useMachineReviewCheck,
  useUserReviewCheck,
} from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors } from "@/src/theme";

interface UserReviewCheckProps {
  machineId: number;
  isDefaultExpanded?: boolean;
}
export default function HasAddedMachineReview({
  machineId,
  isDefaultExpanded = false,
}: UserReviewCheckProps) {
  const { data, isLoading } = useMachineReviewCheck(machineId);
  const isReviewPosted = data?.alreadyReviewed;
  if (isLoading) {
    return null;
  }
  if (isReviewPosted) {
    return <Text>Ocena dodana, docelowo wyswietlic tutaj ocene</Text>;
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
  container: {},
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
});
