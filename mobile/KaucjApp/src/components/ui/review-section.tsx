import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Star } from "lucide-react-native";
import { Controller, useFormContext } from "react-hook-form";
import { colors, rounded, spacing } from "@/src/theme";
import SectionCard from "./section-card";
import * as Haptics from "expo-haptics";
import { useUserById } from "@/src/api/hooks/use-user";
import LoadingState from "../states/loading-state";
import { useUserRating } from "@/src/api/hooks/use-rating";
import UserProfileInfo from "./user-profile-info";
import { RatingFormValues } from "@/src/validation/rating";

export interface ReviewSectionProps {
  userToReviewId: number;
}

export default function ReviewSection({ userToReviewId }: ReviewSectionProps) {
  const {
    data: userToReview,
    isLoading: isLoadingUserToReview,
    isError: isErrorUserToReview,
  } = useUserById(userToReviewId);
  const {
    data: userRating,
    isLoading: isLoadingRating,
    isError: isErrorRating,
  } = useUserRating(userToReviewId);

  const {
    control,
    formState: { errors },
  } = useFormContext<RatingFormValues>();

  if (isLoadingUserToReview || isLoadingRating) {
    return <LoadingState title="Ładowanie informacji o użytkowniku..." />;
  }
  if (!userToReview || isErrorUserToReview || !userRating || isErrorRating) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Oceń współpracę</Text>

      <SectionCard style={styles.card}>
        <UserProfileInfo
          user={userToReview}
          rating={userRating.avgScore}
          ratingCount={userRating.feedbackCount}
          showCourierFrom={true}
        />

        <View style={styles.divider} />

        <Controller
          control={control}
          name="score"
          render={({ field }) => (
            <StarSelector
              rating={field.value}
              onSelect={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (val === field.value) {
                  field.onChange(0);
                  return;
                }
                field.onChange(val);
              }}
            />
          )}
        />

        {errors.score && (
          <Text style={styles.errorText}>Wybierz ocenę przed wysłaniem</Text>
        )}

        <Controller
          control={control}
          name="comment"
          render={({ field }) => (
            <ReviewTextInput
              value={field.value ?? ""}
              onChangeText={field.onChange}
            />
          )}
        />
      </SectionCard>
    </View>
  );
}

interface UserReviewHeaderProps {
  firstName: string;
  lastName: string;
  roleLabel: string;
  rating: number;
  feedbackCount: number;
}

interface StarSelectorProps {
  rating: number;
  onSelect: (rating: number) => void;
}

const StarSelector = ({ rating, onSelect }: StarSelectorProps) => {
  return (
    <View style={starStyles.container}>
      {[1, 2, 3, 4, 5].map((starPosition) => {
        const isActive = starPosition <= rating;
        return (
          <Pressable
            key={starPosition}
            onPress={() => onSelect(starPosition)}
            style={({ pressed }) => [
              starStyles.starButton,
              pressed && starStyles.starPressed,
            ]}
            hitSlop={8}
          >
            <Star
              size={38}
              color={isActive ? colors.status.warning : colors.text.muted}
              fill={isActive ? colors.status.warning : "transparent"}
              strokeWidth={isActive ? 2 : 1.5}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

interface ReviewTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const ReviewTextInput = ({ value, onChangeText }: ReviewTextInputProps) => {
  return (
    <View style={inputStyles.container}>
      <TextInput
        style={inputStyles.input}
        placeholder="Napisz kilka słów o współpracy... (opcjonalnie)"
        placeholderTextColor={colors.text.muted}
        multiline
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
        maxLength={300}
        selectionColor={colors.primary.base}
      />
    </View>
  );
};

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
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.status.error,
    textAlign: "center",
    marginTop: -spacing.xs,
  },
});

const starStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
    transform: [{ scale: 1 }],
  },
  starPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});

const inputStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.xl,
    minHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
});
