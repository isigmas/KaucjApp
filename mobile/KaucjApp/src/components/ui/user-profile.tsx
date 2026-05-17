import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import BottleCapAvatar from "./user-avatar";
import { User, UserRole } from "@/src/types/user";
import { useUserRating } from "@/src/api/hooks/use-rating";
import StarRating from "./star-rating";

interface UserProfileProps {
  user: User;
  role: UserRole;
  showRating?: boolean;
  showStats?: boolean;
  color?: "primary" | "accent";
}

export default function UserProfile({
  user,
  role,
  showRating = true,
  showStats = true,
  color = "primary",
}: UserProfileProps) {
  const { data: userRating } = useUserRating(user.userId);

  return (
    <View style={styles.headerSection}>
      <BottleCapAvatar color={color} />

      <Animated.Text
        entering={FadeInDown.delay(100).springify()}
        style={styles.userName}
      >
        {user.firstName + " " + user.lastName}
      </Animated.Text>

      {showRating && <StarRating rating={userRating} />}

      {showStats && <StatsBadge user={user} role={role} color={color} />}
    </View>
  );
}

interface StatsBadgeProps {
  user: User;
  role: UserRole;
  color: "primary" | "accent";
}

function StatsBadge({ user, role, color }: StatsBadgeProps) {
  const backgroundColor = colors[color].light;
  const textColor = colors[color].dark;
  const text = role === "collector" ? "Odebrano" : "Wystawiono";
  const count =
    role === "collector" ? user.collectedTotalCount : user.returnedTotalCount;

  return (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      style={[styles.statsBadge, { backgroundColor }]}
    >
      <Ionicons name="leaf" size={16} color={textColor} />
      <Text style={[styles.statsText, { color: textColor }]}>
        {text} {count} opakowań PET
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  capOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: colors.primary.base,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    marginBottom: 16,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  capInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.background.card,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    alignItems: "center",
  },

  // Typography
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },

  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
