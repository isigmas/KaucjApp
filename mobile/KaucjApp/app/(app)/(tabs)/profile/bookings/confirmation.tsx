import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ErrorState from "@/src/components/states/error-state";
import ConfirmationWithReview from "@/src/components/standalone-screens/confirmation/confirmation-with-review";

export default function ConfirmationScreen() {
  const { type, userId } = useLocalSearchParams<{
    type: "success" | "cancel";
    userId?: string;
  }>();

  if (type === "success") {
    if (!userId || !Number.isFinite(Number(userId))) {
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
        userId={Number(userId)}
        onSuccess={() => router.dismissTo("/profile/bookings")}
      />
    );
  }

  return <CancelConfirmation />;
}

const CancelConfirmation = () => {
  return (
    <ActionConfirmationLayout
      animationSource={require("@/assets/animations/email-sent.json")}
      title={"Anulowano!"}
      description={"Twoja rezerwacja została pomyślnie anulowana."}
      buttonText={"Rozumiem!"}
      onButtonPress={() => router.dismissTo("/profile/bookings")}
    />
  );
};
