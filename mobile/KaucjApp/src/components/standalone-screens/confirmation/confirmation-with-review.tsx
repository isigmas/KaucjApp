import React from "react";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ReviewSection from "@/src/components/ui/review-section";
import { useAddRating } from "@/src/api/hooks/use-rating";
import { RatingPayload } from "@/src/types";
import { useRouter } from "expo-router";

interface ConfirmationWithReviewProps {
  userId: number;
}

export default function ConfirmationWithReview({
  userId,
}: ConfirmationWithReviewProps) {
  const router = useRouter();

  const {
    mutate: addRating,
    isPending,
    isError: isErrorAddRating,
  } = useAddRating(userId);

  const handleSubmit = () => {
    console.log("Submitting review:");
    const payload: RatingPayload = {
      score: 5,
    };
    router.back();
  };

  return (
    <ActionConfirmationLayout
      animationSource={require("@/assets/animations/email-sent.json")}
      title={"Pomyślnie zakończono!"}
      description={"Ten odbiór został pomyślnie zakończony. Dziękujemy!"}
      buttonText={"Klasa!"}
      onButtonPress={handleSubmit}
    >
      <ReviewSection userToReviewId={userId} roleLabel="Kurier" />
    </ActionConfirmationLayout>
  );
}
