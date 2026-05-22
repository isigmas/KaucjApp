import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import Animated, {
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
} from "react-native-reanimated";

import { colors, rounded, shadows, spacing } from "@/src/theme";
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
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
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
        setIsSuccess(true);
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
    <Animated.View
      layout={layoutSpring}
      style={styles.card}
      entering={FadeInDown.delay(400).springify()}
    >
      {isSuccess ? (
        <SuccessState />
      ) : (
        <FormProvider {...methods}>
          <CardTitle>Oceń kaucjomat</CardTitle>
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
      )}
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

function SuccessState() {
  return (
    <Animated.View
      layout={layoutSpring}
      entering={FadeInUp.delay(200).duration(200).springify()}
      style={styles.successState}
    >
      <Animated.View
        entering={BounceIn.duration(800).delay(100)}
        style={styles.iconContainer}
      >
        <View style={styles.iconBackground}>
          <Text style={styles.iconText}>✓</Text>
        </View>
      </Animated.View>
      <Text style={styles.successStateTitle}>Ocena dodana</Text>
      <Text style={styles.successStateMessage}>
        Dziękujemy, że jesteś częścią społeczności!
      </Text>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.light,
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
  successState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  successStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  successStateMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },

  iconContainer: {
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.base,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: colors.primary.light,
  },
  iconText: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: "900",
  },
});
