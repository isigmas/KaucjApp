import React from "react";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ReviewSection from "@/src/components/ui/review-section";

export default function ConfirmationWithReview() {
  return (
    <ActionConfirmationLayout
      animationSource={require("@/assets/animations/email-sent.json")}
      title={"Pomyślnie zakończono!"}
      description={"Ten odbiór został pomyślnie zakończony. Dziękujemy!"}
      buttonText={"Klasa!"}
      onButtonPress={() => {}}
    >
      <ReviewSection
        userToReview={{ firstName: "Jan", lastName: "Kowalski" }}
        roleLabel="Kurier"
      />
    </ActionConfirmationLayout>
  );
}
