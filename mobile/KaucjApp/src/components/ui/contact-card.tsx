import { useUserById } from "@/src/api/hooks/use-user";
import SectionCard from "@/src/components/ui/section-card";
import { colors, rounded, spacing } from "@/src/theme";
import { MessageCircle, Phone, Star } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import ErrorState from "../states/error-state";
import UserProfileInfo from "./user-profile-info";
import { useUserRating } from "@/src/api/hooks/use-rating";

interface ContactCardProps {
  asCard?: boolean;
  userId: number | null;
  header?: string;
  isTheUserCourier?: boolean;
  onUserProfileInfoPress?: () => void;
}

export default function ContactCard({
  asCard = true,
  userId,
  header,
  isTheUserCourier = false,
  onUserProfileInfoPress,
}: ContactCardProps) {
  if (!userId) {
    return null;
  }
  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
    error,
    refetch,
  } = useUserById(userId);
  const { data: userRating, isLoading: isLoadingUserRating } =
    useUserRating(userId);

  if (isLoadingUser) return null;

  if (isError || !user) {
    return (
      <ErrorState
        title="Nie udało się załadować danych kuriera"
        message={error?.message || "Spróbuj ponownie."}
        onRetry={() => refetch()}
      />
    );
  }

  const handleCall = () => {
    Alert.alert(
      "Wkrótce",
      "Funkcja połączenia z kurierem będzie dostępna już niedługo.",
    );
  };

  const handleMessage = () => {
    Alert.alert(
      "Wkrótce",
      "Funkcja wiadomości do kuriera będzie dostępna już niedługo.",
    );
  };
  const body = (
    <View style={styles.courierSection}>
      {header && <Text style={styles.sectionLabel}>{header}</Text>}

      <UserProfileInfo
        user={user}
        rating={userRating?.avgScore || 0}
        // TODO: add pickups count isted of rating count in this place
        //pickupsCount={0}
        ratingCount={userRating?.feedbackCount || 0}
        showCourierFrom={isTheUserCourier}
        onPress={onUserProfileInfoPress}
      />

      <View style={styles.courierActions}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnOutline,
            pressed && styles.actionBtnOutlinePressed,
          ]}
        >
          <Phone size={15} color={colors.accent.base} strokeWidth={2.2} />
          <Text style={styles.actionBtnOutlineLabel}>Zadzwoń</Text>
        </Pressable>

        <Pressable
          onPress={handleMessage}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnFill,
            pressed && styles.actionBtnFillPressed,
          ]}
        >
          <MessageCircle
            size={15}
            color={colors.text.white}
            strokeWidth={2.2}
          />
          <Text style={styles.actionBtnFillLabel}>Napisz</Text>
        </Pressable>
      </View>
    </View>
  );
  if (!asCard) {
    return body;
  }

  return <SectionCard>{body}</SectionCard>;
}

const styles = StyleSheet.create({
  courierSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: rounded.pill,
    backgroundColor: colors.accent.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.accent.base + "60",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.accent.dark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  courierInfo: {
    flex: 1,
    gap: 2,
  },
  courierName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  courierUsername: {
    fontSize: 12,
    color: colors.text.muted,
  },

  // Action buttons
  courierActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: rounded.lg,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: colors.accent.base,
    backgroundColor: colors.background.card,
  },
  actionBtnOutlinePressed: {
    backgroundColor: colors.accent.light,
  },
  actionBtnOutlineLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent.base,
  },
  actionBtnFill: {
    backgroundColor: colors.accent.base,
    shadowColor: colors.accent.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnFillPressed: {
    backgroundColor: colors.accent.dark,
  },
  actionBtnFillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.white,
  },
});
