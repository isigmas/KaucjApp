import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import SectionCard from "../section-card";
import { useUserById } from "@/src/api/hooks/use-user";
import LoadingState from "@/src/components/states/loading-state";
import { useUserRating } from "@/src/api/hooks/use-rating";
import UserProfileInfo from "../user-profile-info";
import ReviewForm from "./review-form";

export interface ReviewSectionProps {
  userToReviewId: number;
  isTheUserCourier?: boolean;
}

export default function UserReview({
  userToReviewId,
  isTheUserCourier = false,
}: ReviewSectionProps) {
  const {
    data: userToReview,
    isLoading: isLoadingUserToReview,
    isError: isErrorUserToReview,
  } = useUserById(userToReviewId);
  const {
    data: userRating,
    isLoading: isLoadingRating,
    isError: isErrorRating,
  } = useUserRating(userToReviewId);

  if (isLoadingUserToReview || isLoadingRating) {
    return <LoadingState title="Ładowanie informacji o użytkowniku..." />;
  }
  if (!userToReview || isErrorUserToReview || !userRating || isErrorRating) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Oceń współpracę</Text>

      <SectionCard style={styles.card}>
        <UserProfileInfo
          user={userToReview}
          rating={userRating.avgScore}
          ratingCount={userRating.feedbackCount}
          showCourierFrom={isTheUserCourier}
        />

        <View style={styles.divider} />

        <ReviewForm mode="create" />
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: rounded.apple,
    gap: spacing.md,
    borderColor: colors.status.border + "40",
  },
  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    width: "100%",
    opacity: 0.6,
  },
});
