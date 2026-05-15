import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ReviewSection from "@/src/components/ui/review-section";

export default function ConfirmationScreen() {
  const router = useRouter();

  const { type } = useLocalSearchParams<{ type: "success" | "cancel" }>();

  const contentMap = {
    success: {
      animationSource: require("@/assets/animations/email-sent.json"),
      title: "Pomyślnie zakończono!",
      description: "Ten odbiór został pomyślnie zakończony. Dziękujemy!",
      buttonText: "Klasa!",
      action: () => router.dismissTo("/profile/offers"),
    },
    cancel: {
      animationSource: require("@/assets/animations/email-sent.json"),
      title: "Anulowano!",
      description:
        "Twoja oferta została pomyślnie anulowana. Nie będzie już widoczna dla kurierów.",
      buttonText: "Rozumiem!",
      action: () => router.dismissTo("/profile/offers"),
    },
  };

  const activeContent = contentMap[type] || contentMap.success;

  return (
    <ActionConfirmationLayout
      animationSource={activeContent.animationSource}
      title={activeContent.title}
      description={activeContent.description}
      buttonText={activeContent.buttonText}
      onButtonPress={activeContent.action}
    >
      <ReviewSection
        userToReview={{ firstName: "Jan", lastName: "Kowalski" }}
        roleLabel="Kurier"
      />
    </ActionConfirmationLayout>
  );
}
