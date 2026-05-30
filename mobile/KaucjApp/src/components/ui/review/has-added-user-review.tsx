import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useUserReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors } from "@/src/theme";
import { UserRole } from "@/src/types/user";
import PreviewOrEditReview from "./preview-or-edit-review";

interface UserReviewCheckProps {
  role: UserRole;
  userId: number | null;
  offerId: number | null;
  isDefaultExpanded?: boolean;
}
export default function UserReviewCheck({
  userId,
  offerId,
  role,
  isDefaultExpanded = false,
}: UserReviewCheckProps) {
  if (!userId || !offerId) {
    return null;
  }

  const { data, isLoading } = useUserReviewCheck(offerId, userId);
  const isReviewPosted = data?.alreadyReviewed;
  const existingReview = data?.review ?? null;
  if (isLoading) {
    return null;
  }
  if (isReviewPosted && existingReview) {
    return (
      <PreviewOrEditReview
        existingReview={existingReview}
        type="user"
        userId={userId}
        offerId={offerId}
      />
    );
  }

  return (
    <View>
      <Text style={styles.title}>
        Oceń {role === "creator" ? "wystawiającego" : "kuriera"}
      </Text>
      <ExpandableReview
        type="user"
        userId={userId}
        offerId={offerId}
        isDefaultExpanded={isDefaultExpanded}
      />
    </View>
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
