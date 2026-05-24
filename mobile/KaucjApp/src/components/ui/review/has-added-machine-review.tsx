import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useMachineReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors, spacing } from "@/src/theme";
import ReviewCard from "./review-list-card";
import Animated, { FadeInDown } from "react-native-reanimated";
import PreviewOrEditReview from "./preview-or-edit-review";

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
      <PreviewOrEditReview
        machineId={machineId}
        existingReview={existingReview}
      />
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
