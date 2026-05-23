import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "react-native";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import { useAddUserReview } from "@/src/api/hooks/use-rating";
import { UserReviewPayload } from "@/src/types";
import { ratingSchema, RatingFormValues } from "@/src/validation/rating";
import * as Haptics from "expo-haptics";
import UserReview from "../../ui/review/user-review";

interface ConfirmationWithReviewProps {
  userId: number;
  offerId: number;
  onSuccess: () => void;
  isTheUserToReviewCourier?: boolean;
}

export default function ConfirmationWithReview({
  userId,
  offerId,
  onSuccess,
  isTheUserToReviewCourier = false,
}: ConfirmationWithReviewProps) {
  const { mutate: addUserReview, isPending } = useAddUserReview(userId);

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
    const payload: UserReviewPayload = {
      offerId: offerId,
      score: data.score,
      ...(data.comment &&
        data.comment.trim() !== "" && { comment: data.comment }),
    };
    addUserReview(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      },
      onError: (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <UserReview
          userToReviewId={userId}
          isTheUserCourier={isTheUserToReviewCourier}
        />
      </ActionConfirmationLayout>
    </FormProvider>
  );
}
