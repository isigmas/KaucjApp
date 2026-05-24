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

  if (isLoading) {
    return null;
  }

  return (
    <ExpandableReview
      type="machine"
      machineId={machineId}
      isDefaultExpanded={isDefaultExpanded}
      existingReview={data?.review ?? null}
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
