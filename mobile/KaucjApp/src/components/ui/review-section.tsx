import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Star } from "lucide-react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { User } from "@/src/types/user";
import SectionCard from "./section-card";
import * as Haptics from "expo-haptics";

export interface ReviewSectionProps {
  userToReview: Pick<User, "firstName" | "lastName">;
  roleLabel?: string;
}

export default function ReviewSection({
  userToReview,
  roleLabel = "Użytkownik",
}: ReviewSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");

  const handleStarSelect = (selectedRating: number) => {
    if (selectedRating === rating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(selectedRating);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Oceń współpracę</Text>

      <SectionCard style={styles.card}>
        <UserReviewHeader user={userToReview} role={roleLabel} />

        <View style={styles.divider} />

        <StarSelector rating={rating} onSelect={handleStarSelect} />

        <ReviewTextInput value={reviewText} onChangeText={setReviewText} />
      </SectionCard>
    </View>
  );
}

interface UserReviewHeaderProps {
  user: Pick<User, "firstName" | "lastName">;
  role: string;
}

const UserReviewHeader = ({ user, role }: UserReviewHeaderProps) => {
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.avatar}>
        <Text style={headerStyles.initials}>{initials}</Text>
      </View>
      <View style={headerStyles.info}>
        <Text style={headerStyles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={headerStyles.role}>{role} od 2026</Text>
      </View>
    </View>
  );
};

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
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: rounded.pill,
    backgroundColor: colors.accent.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: `${colors.accent.base}40`, // 40 represents opacity in hex
  },
  initials: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.accent.dark,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
  },
  role: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  date: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const starStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
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
