import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useUserReviewCheck } from "@/src/api/hooks/use-rating";
import ExpandableReview from "./expandable-review";
import { colors, spacing } from "@/src/theme";
import { UserRole } from "@/src/types/user";

interface UserReviewCheckProps {
  role: UserRole;
  userId: number | null;
  offerId: number | null;
}
export default function UserReviewCheck({
  userId,
  offerId,
  role,
}: UserReviewCheckProps) {
  if (!userId || !offerId) {
    return null;
  }

  const { data } = useUserReviewCheck(offerId, userId);
  const isReviewPosted = data?.alreadyReviewed;
  if (isReviewPosted) {
    return <Text>Ocena dodana, docelowo wyswietlic tutaj ocene</Text>;
  }

  return (
    <View>
      <Text style={styles.title}>
        Oceń {role === "creator" ? "użytkownika" : "kuriera"}
      </Text>
      <ExpandableReview type="user" userId={userId} offerId={offerId} />
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
