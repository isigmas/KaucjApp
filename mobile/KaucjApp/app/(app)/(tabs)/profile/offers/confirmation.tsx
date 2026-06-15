import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ConfirmationWithReview from "@/src/components/standalone-screens/confirmation/confirmation-with-review";
import ErrorState from "@/src/components/states/error-state";

export default function ConfirmationScreen() {
  const { type, userId, offerId } = useLocalSearchParams<{
    type: "success" | "cancel";
    userId?: string;
    offerId?: string;
  }>();

  if (type === "success") {
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
        onSuccess={() => router.dismissTo("/profile/offers")}
        isTheUserToReviewCourier={true}
      />
    );
  }
  return <CancelConfirmation />;
}

const CancelConfirmation = () => {
  return (
    <ActionConfirmationLayout
      title={"Anulowano!"}
      description={
        "Twoja oferta została pomyślnie anulowana. Nie będzie już widoczna dla kurierów."
      }
      buttonText={"Rozumiem!"}
      onButtonPress={() => router.dismissTo("/profile/offers")}
    />
  );
};
