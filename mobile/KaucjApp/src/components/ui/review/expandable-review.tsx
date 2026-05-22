import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import Animated, {
  BounceIn,
  EntryOrExitLayoutType,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SharedValue,
} from "react-native-reanimated";

import { colors, rounded, shadows, spacing } from "@/src/theme";
import { StarSelector, ReviewTextInput } from "./review-form";
import { RatingFormValues, ratingSchema } from "@/src/validation";
import {
  useAddMachineReview,
  useAddUserReview,
} from "@/src/api/hooks/use-rating";
import { MachineReviewPayload, UserReviewPayload } from "@/src/types";
import CardTitle from "../../map/details/card-title";
import { layoutSpring } from "@/src/constants";

type ReviewType = "machine" | "user";

interface BaseExpandableReviewProps {
  type: ReviewType;
  isDefaultExpanded?: boolean;
}

interface MachineReviewProps extends BaseExpandableReviewProps {
  type: "machine";
  machineId: number;
}

interface UserReviewProps extends BaseExpandableReviewProps {
  type: "user";
  userId: number;
  offerId: number;
}

export type ExpandableReviewProps = MachineReviewProps | UserReviewProps;

export default function ExpandableReview(props: ExpandableReviewProps) {
  if (props.type === "machine") {
    return <MachineReview {...props} />;
  }
  return <UserReview {...props} />;
}

function MachineReview({
  machineId,
  isDefaultExpanded,
}: Omit<MachineReviewProps, "type">) {
  const { mutate: addMachineReview, isPending } =
    useAddMachineReview(machineId);

  const handleSubmit = (
    data: RatingFormValues,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    const payload: MachineReviewPayload = {
      score: data.score,
      ...(data.comment?.trim() ? { comment: data.comment.trim() } : {}),
    };

    addMachineReview(payload, { onSuccess, onError });
  };

  return (
    <ExpandableReviewForm
      title="Oceń kaucjomat"
      isPending={isPending}
      onSubmit={handleSubmit}
      entering={FadeInDown.delay(400).springify()}
      isDefaultExpanded={isDefaultExpanded}
    />
  );
}

function UserReview({
  userId,
  offerId,
  isDefaultExpanded,
}: Omit<UserReviewProps, "type">) {
  const { mutate: addUserReview, isPending } = useAddUserReview(userId);

  const handleSubmit = (
    data: RatingFormValues,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    const payload: UserReviewPayload = {
      offerId,
      score: data.score,
      ...(data.comment?.trim() ? { comment: data.comment.trim() } : {}),
    };

    addUserReview(payload, { onSuccess, onError });
  };

  return (
    <ExpandableReviewForm
      isPending={isPending}
      onSubmit={handleSubmit}
      isDefaultExpanded={isDefaultExpanded}
      style={{
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        marginBottom: 0,
        paddingBottom: spacing.sm,
        paddingHorizontal: 0,
      }}
    />
  );
}

interface ExpandableReviewFormProps {
  title?: string;
  isPending: boolean;
  isDefaultExpanded?: boolean;
  onSubmit: (
    data: RatingFormValues,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => void;
  style?: StyleProp<ViewStyle>;
  entering?: EntryOrExitLayoutType;
}

function ExpandableReviewForm({
  title,
  isPending,
  isDefaultExpanded = false,
  onSubmit,
  style,
  entering,
}: ExpandableReviewFormProps) {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const buttonText = isPending ? "Wysyłanie..." : "Dodaj opinię";

  const methods = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { score: 0, comment: "" },
    mode: "onSubmit",
  });

  const currentScore = useWatch({
    control: methods.control,
    name: "score",
  });

  const isExpanded = isDefaultExpanded || currentScore > 0;

  const handleFormSubmit = (data: RatingFormValues) => {
    onSubmit(
      data,
      () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSuccess(true);
        methods.reset();
      },
      (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error(`Error submitting: `, error);
        Alert.alert("Błąd", "Nie udało się dodać oceny. Spróbuj ponownie.");
      },
    );
  };

  return (
    <Animated.View
      layout={layoutSpring}
      entering={entering}
      style={[styles.card, style]}
    >
      {isSuccess ? (
        <SuccessState />
      ) : (
        <FormProvider {...methods}>
          {title && <CardTitle>{title}</CardTitle>}
          <View style={styles.starsContainer}>
            <Controller
              control={methods.control}
              name="score"
              render={({ field, fieldState: { error } }) => (
                <>
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
                  {error && (
                    <Text style={styles.errorText}>
                      Wybierz ocenę przed wysłaniem
                    </Text>
                  )}
                </>
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
                onPress={methods.handleSubmit(handleFormSubmit)}
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
  starsContainer: {},
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
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
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
