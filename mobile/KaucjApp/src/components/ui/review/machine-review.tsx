import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import SectionCard from "../section-card";
import ReviewForm from "./review-form";
import { FormProvider, useForm } from "react-hook-form";
import { RatingFormValues, ratingSchema } from "@/src/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddMachineReview } from "@/src/api/hooks/use-rating";
import { MachineReviewPayload } from "@/src/types";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

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

  const onSubmit = (data: RatingFormValues) => {
    const payload: MachineReviewPayload = {
      score: data.score,
      ...(data.comment &&
        data.comment.trim() !== "" && { comment: data.comment }),
    };
    addMachineReview(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error("Error submitting review:", error);
        Alert.alert("Błąd", "Nie udało się dodać oceny.");
        methods.reset();
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Oceń kaucjomat</Text>

      <SectionCard style={styles.card}>
        <View style={styles.divider} />
        <FormProvider {...methods}>
          <ReviewForm mode="create" />

          <SubmitButton
            onPress={methods.handleSubmit(onSubmit)}
            disabled={isPending}
            text={buttonText}
          />
        </FormProvider>
      </SectionCard>
    </View>
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
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.submitButtonText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: rounded.apple,
    gap: spacing.md,
    borderColor: colors.status.border + "40",
  },
  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    width: "100%",
    opacity: 0.6,
  },
  submitButton: {
    backgroundColor: colors.primary.base,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
