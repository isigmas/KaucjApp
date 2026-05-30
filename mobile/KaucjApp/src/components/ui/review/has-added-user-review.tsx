import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useUserReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { UserRole } from "@/src/types/user";
import PreviewOrEditReview from "./preview-or-edit-review";
import CardTitle from "../../map/details/card-title";

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
      <TitleAndReviewWrapper>
        <PreviewOrEditReview
          existingReview={existingReview}
          type="user"
          userId={userId}
          offerId={offerId}
          cardStyle={styles.card}
        />
      </TitleAndReviewWrapper>
    );
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>
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

function TitleAndReviewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Twoja opinia</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rounded.lg,
    borderColor: colors.status.border,
    borderWidth: 0.5,
    paddingTop: 0,
    shadowOpacity: 0.1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
