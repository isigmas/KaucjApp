import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import ConfirmationWithReview from "@/src/components/standalone-screens/confirmation/confirmation-with-review";
import ErrorState from "@/src/components/states/error-state";

export default function ConfirmationScreen() {
  const { userId, offerId } = useLocalSearchParams<{
    userId?: string;
    offerId?: string;
  }>();

  if (
    !userId ||
    !Number.isFinite(Number(userId)) ||
    !offerId ||
    !Number.isFinite(Number(offerId))
  ) {
    return (
      <ErrorState
        title="Wystąpił błąd"
        message="Nie udało się załadować danych."
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <ConfirmationWithReview
      offerId={Number(offerId)}
      userId={Number(userId)}
      onSuccess={() => router.dismissTo("/profile")}
      isTheUserToReviewCourier={false}
    />
  );
}
