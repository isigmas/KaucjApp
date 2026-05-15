import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";

export default function ConfirmationScreen() {
  const router = useRouter();

  const { type } = useLocalSearchParams<{ type: "success" | "cancel" }>();

  const contentMap = {
    success: {
      animationSource: require("@/assets/animations/email-sent.json"),
      title: "Pomyślnie zakończono!",
      description: "Ten odbiór został pomyślnie zakończony. Dziękujemy!",
      buttonText: "Wróć do rezerwacji",
      action: () => router.dismissTo("/profile/bookings"),
    },
    cancel: {
      animationSource: require("@/assets/animations/email-sent.json"),
      title: "Anulowano",
      description: "Twoja rezerwacja została pomyślnie anulowana.",
      buttonText: "Rozumiem!",
      action: () => router.dismissTo("/profile/bookings"),
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
    />
  );
}
