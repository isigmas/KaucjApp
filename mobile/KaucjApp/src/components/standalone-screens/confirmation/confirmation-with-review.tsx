import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "react-native";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ReviewSection from "@/src/components/ui/review-section";
import { useAddRating } from "@/src/api/hooks/use-rating";
import { RatingPayload } from "@/src/types";
import { ratingSchema, RatingFormValues } from "@/src/validation/rating";

interface ConfirmationWithReviewProps {
  userId: number;
  onSuccess: () => void;
}

export default function ConfirmationWithReview({
  userId,
  onSuccess,
}: ConfirmationWithReviewProps) {
  const { mutate: addRating, isPending } = useAddRating(userId);

  const methods = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { score: 0, comment: "" },
  });

  const hasReview = methods.watch("score") > 0;

  const buttonText = isPending
    ? "Wysyłanie..."
    : hasReview
      ? "Wyślij ocenę i zakończ"
      : "Zakończ";

  const onSubmit = (data: RatingFormValues) => {
    const payload: RatingPayload = { score: data.score };
    addRating(payload, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        console.error("Error submitting review:", error);
        Alert.alert("Błąd", "Nie udało się dodać oceny.");
        methods.reset();
      },
    });
  };

  const handleButtonPress = () => {
    if (!hasReview) {
      onSuccess();
      return;
    }
    methods.handleSubmit(onSubmit)();
  };

  return (
    <FormProvider {...methods}>
      <ActionConfirmationLayout
        animationSource={require("@/assets/animations/email-sent.json")}
        title={"Pomyślnie zakończono!"}
        description={"Ten odbiór został pomyślnie zakończony. Dziękujemy!"}
        buttonText={buttonText}
        onButtonPress={handleButtonPress}
        isLoading={isPending}
      >
        <ReviewSection userToReviewId={userId} />
      </ActionConfirmationLayout>
    </FormProvider>
  );
}
