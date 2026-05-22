import { View, Text } from "react-native";
import React from "react";
import { useUserReviewCheck } from "@/src/api/hooks/use-rating";

interface UserReviewCheckProps {
  userId: number | null;
  offerId: number | null;
}
export default function UserReviewCheck({
  userId,
  offerId,
}: UserReviewCheckProps) {
  if (!userId || !offerId) {
    return null;
  }

  const { data, isLoading: isLoadingUserReviewCheck } = useUserReviewCheck(
    offerId,
    userId,
  );
  const isReviewPosted = data?.alreadyReviewed;

  return (
    <View>
      {isReviewPosted ? (
        <Text>Review posted</Text>
      ) : (
        <Text>Review not posted</Text>
      )}
    </View>
  );
}
