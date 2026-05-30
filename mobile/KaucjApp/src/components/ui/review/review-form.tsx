import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Star } from "lucide-react-native";
import { Controller, useFormContext } from "react-hook-form";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";
import { RatingFormValues } from "@/src/validation/rating";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ReviewForm({ mode }: { mode: "create" | "edit" }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<RatingFormValues>();

  return (
    <View style={styles.fieldsContainer}>
      <Controller
        control={control}
        name="score"
        render={({ field }) => (
          <>
            <StarSelector
              rating={field.value}
              onSelect={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Allow deselecting the star if it's already selected
                if (val === field.value) {
                  field.onChange(0);
                  return;
                }
                field.onChange(val);
              }}
            />
            {errors.score && (
              <Text style={styles.errorText}>
                Wybierz ocenę przed wysłaniem
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <ReviewTextInput
            value={field.value ?? ""}
            onChangeText={field.onChange}
            placeholder={
              mode === "edit"
                ? "Edytuj swoją opinię... (opcjonalnie)"
                : "Napisz kilka słów... (opcjonalnie)"
            }
          />
        )}
      />
    </View>
  );
}

// --- Reusable UI Subcomponents ---

interface StarSelectorProps {
  rating: number;
  onSelect: (rating: number) => void;
}

export const StarSelector = ({ rating, onSelect }: StarSelectorProps) => {
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
            hitSlop={12}
          >
            <Animated.View
              entering={FadeInDown.delay(starPosition * 100 - 100)
                .springify()
                .damping(50)
                .stiffness(500)
                .mass(2.5)}
            >
              <Star
                size={38}
                color={
                  isActive
                    ? colors.status?.warning || "#FFB800"
                    : colors.text.muted
                }
                fill={
                  isActive ? colors.status?.warning || "#FFB800" : "transparent"
                }
                strokeWidth={isActive ? 2 : 1.5}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

interface ReviewTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const ReviewTextInput = ({
  value,
  onChangeText,
  placeholder,
}: ReviewTextInputProps) => {
  return (
    <View style={inputStyles.container}>
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder || "Napisz komentarz..."}
        placeholderTextColor={colors.text.muted}
        multiline
        value={value}
        onChangeText={onChangeText}
        returnKeyType="done"
        blurOnSubmit={true}
        textAlignVertical="top"
        maxLength={300}
        selectionColor={colors.primary?.base || "#007AFF"}
      />
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  fieldsContainer: {
    gap: spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.status?.error || "#FF3B30",
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
    backgroundColor: colors.background?.subtle || "#F2F2F7",
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
