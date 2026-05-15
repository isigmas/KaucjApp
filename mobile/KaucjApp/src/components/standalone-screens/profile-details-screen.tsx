import React from "react";

import ContactCard from "../ui/contact-card";
import { ScrollView, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { router } from "expo-router";
import SectionCard from "../ui/section-card";

interface ProfileDetailsScreenProps {
  userId: string;
}
export default function ProfileDetailsScreen({
  userId,
}: ProfileDetailsScreenProps) {
  const userIdNumber = Number(userId);
  if (!Number.isFinite(userIdNumber)) {
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
      <SectionCard style={styles.card}>
        <ContactCard
          asCard={false}
          userId={userIdNumber}
          header="Profil użytkownika"
          isTheUserCourier={false}
          onUserProfileInfoPress={() => {}}
        />
      </SectionCard>
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
