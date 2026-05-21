import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { colors, rounded, spacing } from "@/src/theme";
import { StarSelector, ReviewTextInput } from "./review-form";
import { RatingFormValues, ratingSchema } from "@/src/validation";
import { useAddMachineReview } from "@/src/api/hooks/use-rating";
import { MachineReviewPayload } from "@/src/types";
import CardTitle from "../../map/details/card-title";
import { layoutSpring } from "@/src/constants";

interface MachineReviewProps {
  machineId: number;
}

export default function MachineReview({ machineId }: MachineReviewProps) {
  const { mutate: addMachineReview, isPending } =
    useAddMachineReview(machineId);
  const buttonText = isPending ? "Wysyłanie..." : "Dodaj opinię";

  const methods = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { score: 0, comment: "" },
  });

  const currentScore = useWatch({
    control: methods.control,
    name: "score",
  });

  const isExpanded = currentScore > 0;

  const onSubmit = (data: RatingFormValues) => {
    const payload: MachineReviewPayload = {
      score: data.score,
      ...(data.comment &&
        data.comment.trim() !== "" && { comment: data.comment }),
    };

    addMachineReview(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        methods.reset();
      },
      onError: (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error("Error submitting review:", error);
        Alert.alert("Błąd", "Nie udało się dodać oceny.");
      },
    });
  };

  return (
    <Animated.View layout={layoutSpring} style={styles.card}>
      <CardTitle>Oceń kaucjomat</CardTitle>
      <FormProvider {...methods}>
        <View style={styles.starsContainer}>
          <Controller
            control={methods.control}
            name="score"
            render={({ field }) => (
              <StarSelector
                rating={field.value}
                onSelect={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Allows deselecting to collapse the card gracefully
                  if (val === field.value) {
                    field.onChange(0);
                    return;
                  }
                  field.onChange(val);
                }}
              />
            )}
          />
        </View>

        {isExpanded && (
          <Animated.View
            entering={FadeIn.duration(420)}
            exiting={FadeOut.duration(140)}
            style={styles.expandedContent}
          >
            <Controller
              control={methods.control}
              name="comment"
              render={({ field }) => (
                <ReviewTextInput
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  placeholder="Napisz kilka słów... (opcjonalnie)"
                />
              )}
            />

            <SubmitButton
              onPress={methods.handleSubmit(onSubmit)}
              disabled={isPending}
              text={buttonText}
            />

            <Text style={styles.secondaryText}>
              Twoja opinia będzie widoczna publicznie
            </Text>
          </Animated.View>
        )}
      </FormProvider>
    </Animated.View>
  );
}

function SubmitButton({
  onPress,
  disabled,
  text,
}: {
  onPress: () => void;
  disabled: boolean;
  text: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.submitButton,
        pressed && styles.submitButtonPressed,
        disabled && styles.submitButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.submitButtonText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  starsContainer: {
    marginTop: spacing.xs,
  },
  expandedContent: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary.base,
    paddingVertical: spacing.md,
    borderRadius: rounded.lg,
    alignItems: "center",
  },
  submitButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.text.secondary,
  },
});
