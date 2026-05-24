import React, { useState, useEffect } from "react";
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
} from "react-native-reanimated";

import { colors, rounded, shadows, spacing } from "@/src/theme";
import { StarSelector, ReviewTextInput } from "./review-form";
import { RatingFormValues, ratingSchema } from "@/src/validation";
import {
  useAddMachineReview,
  useUpdateMachineReview,
  useAddUserReview,
  useUpdateUserReview,
} from "@/src/api/hooks/use-rating";
import { MachineReviewPayload, UserReviewPayload, Review } from "@/src/types";
import CardTitle from "../../map/details/card-title";
import { layoutSpring } from "@/src/constants";
import { useAuth } from "@/src/auth/use-auth";

type ReviewType = "machine" | "user";

interface BaseExpandableReviewProps {
  type: ReviewType;
  isDefaultExpanded?: boolean;
  existingReview?: Review | null;
  style?: StyleProp<ViewStyle>;
}

interface MachineReviewProps extends BaseExpandableReviewProps {
  type: "machine";
  machineId: number;
  onEditCancel?: () => void;
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
  existingReview,
  style,
  onEditCancel,
}: Omit<MachineReviewProps, "type">) {
  const { user } = useAuth();
  const username = user?.username;

  const isEditMode = !!existingReview;

  const { mutate: addMachineReview, isPending: isAdding } =
    useAddMachineReview(machineId);
  const { mutate: updateMachineReview, isPending: isUpdating } =
    useUpdateMachineReview(existingReview?.reviewId ?? 0, machineId);

  const isPending = isAdding || isUpdating;

  if (!username) {
    return null;
  }

  const handleSubmit = (
    data: RatingFormValues,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    const payload: MachineReviewPayload = {
      reviewerUsername: username,
      score: data.score,
      ...(data.comment?.trim() ? { comment: data.comment.trim() } : {}),
    };

    if (isEditMode) {
      updateMachineReview(payload, { onSuccess, onError });
    } else {
      addMachineReview(payload, { onSuccess, onError });
    }
  };

  const initialValues: RatingFormValues = {
    score: existingReview?.score ?? 0,
    comment: existingReview?.comment ?? "",
  };

  return (
    <ExpandableReviewForm
      title={isEditMode ? "Edytuj opinię" : "Oceń kaucjomat"}
      isPending={isPending}
      isEditMode={isEditMode}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      entering={FadeInDown.delay(isEditMode ? 100 : 400).springify()}
      isDefaultExpanded={isDefaultExpanded || isEditMode}
      style={style}
      onEditCancel={onEditCancel}
    />
  );
}

function UserReview({
  userId,
  offerId,
  isDefaultExpanded,
  existingReview,
  style = {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 0,
    paddingBottom: spacing.sm,
    paddingHorizontal: 0,
  },
}: Omit<UserReviewProps, "type">) {
  const isEditMode = !!existingReview;

  const { mutate: addUserReview, isPending: isAdding } =
    useAddUserReview(userId);
  const { mutate: updateUserReview, isPending: isUpdating } =
    useUpdateUserReview(existingReview?.reviewId ?? 0, userId);

  const isPending = isAdding || isUpdating;

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

    if (isEditMode) {
      updateUserReview(payload, { onSuccess, onError });
    } else {
      addUserReview(payload, { onSuccess, onError });
    }
  };

  const initialValues: RatingFormValues = {
    score: existingReview?.score ?? 0,
    comment: existingReview?.comment ?? "",
  };

  return (
    <ExpandableReviewForm
      isPending={isPending}
      isEditMode={isEditMode}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      isDefaultExpanded={isDefaultExpanded || isEditMode}
      style={style}
    />
  );
}

interface ExpandableReviewFormProps {
  title?: string;
  isPending: boolean;
  isEditMode?: boolean;
  initialValues?: RatingFormValues;
  isDefaultExpanded?: boolean;
  onSubmit: (
    data: RatingFormValues,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => void;
  style?: StyleProp<ViewStyle>;
  entering?: EntryOrExitLayoutType;
  onEditCancel?: () => void;
}

function ExpandableReviewForm({
  title,
  isPending,
  isEditMode = false,
  initialValues = { score: 0, comment: "" },
  isDefaultExpanded = false,
  onSubmit,
  style,
  entering,
  onEditCancel,
}: ExpandableReviewFormProps) {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const buttonText = isPending
    ? "Zapisywanie..."
    : isEditMode
      ? "Zapisz zmiany"
      : "Dodaj opinię";

  const methods = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues, methods]);

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
        if (!isEditMode) {
          methods.reset();
        }
      },
      (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error(`Error submitting: `, error);
        Alert.alert("Błąd", "Nie udało się zapisać oceny. Spróbuj ponownie.");
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
        <SuccessState isEditMode={isEditMode} onComplete={onEditCancel} />
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
                      if (val === field.value && !isEditMode) {
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

              {isEditMode ? (
                <Pressable
                  onPress={onEditCancel}
                  disabled={isPending}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Anuluj edycję</Text>
                </Pressable>
              ) : (
                <Text style={styles.secondaryText}>
                  Twoja opinia będzie widoczna publicznie
                </Text>
              )}
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

//TODO: przemyśleć jak najlepiej drillować propsy do tego komponentu zeby np przełączyć widok na istniejącą opinię
function SuccessState({
  isEditMode,
  onComplete,
}: {
  isEditMode: boolean;
  onComplete?: () => void;
}) {
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
      <Text style={styles.successStateTitle}>
        {isEditMode ? "Zmiany zapisane" : "Ocena dodana"}
      </Text>
      <Text style={styles.successStateMessage}>
        {isEditMode
          ? "Twoja opinia została zaktualizowana."
          : "Dziękujemy, że jesteś częścią społeczności!"}
      </Text>
      {onComplete && (
        <Pressable onPress={onComplete} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Zobacz opinię</Text>
        </Pressable>
      )}
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
  cancelButton: {
    marginTop: spacing.xs,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
    textDecorationLine: "underline",
    alignSelf: "center",
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
