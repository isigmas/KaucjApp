import React from "react";

import { ScrollView, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { router } from "expo-router";
import UserProfile from "@/src/components/ui/user-profile";
import { useUserById } from "@/src/api/hooks/use-user";
import ReviewsSection from "@/src/components/ui/review/reviews-list";
import { UserRole } from "@/src/types/user";

interface ProfileDetailsScreenProps {
  userId: string;
  role: UserRole;
}
export default function ProfileDetailsScreen({
  userId,
  role,
}: ProfileDetailsScreenProps) {
  const userIdNumber = Number(userId);
  if (!Number.isFinite(userIdNumber)) {
    router.back();
    return null;
  }
  const { data: user } = useUserById(userIdNumber);
  if (!user) {
    router.back();
    return null;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <UserProfile
        user={user}
        role={role}
        showRating={true}
        showStats={true}
        color="accent"
      />

      <ReviewsSection userId={userIdNumber} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -5,
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: spacing.md,
    paddingVertical: spacing.xxl,
  },
  card: {
    borderRadius: rounded.apple,
  },
});
