import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ConfirmationWithReview from "@/src/components/standalone-screens/confirmation/confirmation-with-review";

export default function ConfirmationScreen() {
  const { type } = useLocalSearchParams<{ type: "success" | "cancel" }>();

  if (type === "success") {
    return <ConfirmationWithReview />;
  }
  return <CancelConfirmation />;
}

const CancelConfirmation = () => {
  const router = useRouter();
  return (
    <ActionConfirmationLayout
      animationSource={require("@/assets/animations/email-sent.json")}
      title={"Anulowano!"}
      description={
        "Twoja oferta została pomyślnie anulowana. Nie będzie już widoczna dla kurierów."
      }
      buttonText={"Rozumiem!"}
      onButtonPress={() => router.dismissTo("/profile/offers")}
    />
  );
};
