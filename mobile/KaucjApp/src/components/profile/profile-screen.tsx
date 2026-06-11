import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, {
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/use-auth";
import UserProfile from "../ui/user-profile";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useAuth();

  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {user && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/profile/stats",
              params: { userId: user.userId },
            })
          }
        >
          <UserProfile user={user} role="creator" />
        </Pressable>
      )}

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Twoja aktywność</Text>
        <View style={styles.itemsSection}>
          <ProfileMenuItem
            icon="list"
            title="Moje ogłoszenia"
            subtitle="Aktywne i zakończone"
            delay={500}
            onPress={() => router.push("/profile/offers")}
          />
          <View style={styles.separator} />
          <ProfileMenuItem
            icon="calendar"
            title="Moje rezerwacje"
            subtitle="Oczekujące odbiory"
            delay={400}
            onPress={() => router.push("/profile/bookings")}
          />
          <View style={styles.separator} />

          <ProfileMenuItem
            icon="trophy"
            title="Ranking"
            subtitle="Top użytkownicy"
            delay={600}
            onPress={() => router.push("/profile/ranking")}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Konto</Text>

        <View style={styles.itemsSection}>
          <ProfileMenuItem
            icon="settings"
            title="Ustawienia"
            delay={700}
            onPress={() => router.push("/profile/settings")}
          />
          <View style={styles.separator} />

          <ProfileMenuItem
            icon="help-circle"
            title="Pomoc i wsparcie"
            delay={800}
            onPress={() => console.log("Pomoc")}
          />
          <View style={styles.separator} />

          <ProfileMenuItem
            icon="log-out"
            title="Wyloguj się"
            isDestructive={true}
            delay={900}
            onPress={() => signOut()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  isDestructive?: boolean;
  delay: number;
  onPress: () => void;
}

const ProfileMenuItem = ({
  icon,
  title,
  subtitle,
  isDestructive,
  delay,
  onPress,
}: MenuItemProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInLeft.delay(delay)
        .springify()
        .damping(50)
        .stiffness(500)
        .mass(2.5)}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.96, { damping: 40 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 60 }))}
        style={[styles.menuItem, animatedStyle]}
      >
        <View
          style={[
            styles.menuIconBox,
            isDestructive && styles.menuIconBoxDestructive,
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={isDestructive ? colors.status.error : colors.primary.dark}
          />
        </View>

        <View style={styles.menuTextContainer}>
          <Text
            style={[
              styles.menuTitle,
              isDestructive && styles.menuTitleDestructive,
            ]}
          >
            {title}
          </Text>
          {/* {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>} */}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  // Typography
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingCount: {
    fontWeight: "400",
    color: colors.text.secondary,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.dark,
  },

  // Menu Styles
  menuSection: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 8,
  },
  itemsSection: {
    padding: spacing.sm,
    flexDirection: "column",
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    ...shadows.medium,
    gap: spacing.sm,
  },
  separator: {
    height: 0.6,
    backgroundColor: colors.status.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",

    padding: spacing.sm,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: rounded.apple,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  menuIconBoxDestructive: {
    backgroundColor: "#FEF2F2", // Very light red
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  menuTitleDestructive: {
    color: colors.status.error,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
