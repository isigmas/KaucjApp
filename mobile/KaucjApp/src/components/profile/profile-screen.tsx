import React, { use } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInLeft,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/use-auth";
import { useUserDetails } from "@/src/api/hooks/use-user";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BottleCapAvatar = ({ imageUrl }: { imageUrl?: string }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      style={styles.capOuter}
    >
      <View style={styles.capInner}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={colors.primary.base} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

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
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { data: user } = useUserDetails();

  const userRating = 4.8;
  const reviewCount = 24;

  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <BottleCapAvatar />

        <Animated.Text
          entering={FadeInDown.delay(100).springify()}
          style={styles.userName}
        >
          {user?.firstName + " " + user?.lastName || "Jan Kowalski"}
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.ratingContainer}
        >
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(userRating) ? "star" : "star-outline"}
                size={16}
                color={colors.status.warning}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {userRating}{" "}
            <Text style={styles.ratingCount}>({reviewCount} opinii)</Text>
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsBadge}
        >
          <Ionicons name="leaf" size={16} color={colors.primary.dark} />
          <Text style={styles.statsText}>Zwrócono 120 opakowań PET</Text>
        </Animated.View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Twoja aktywność</Text>

        <ProfileMenuItem
          icon="calendar"
          title="Moje rezerwacje"
          subtitle="Oczekujące odbiory"
          delay={400}
          onPress={() => router.push("/profile/bookings")}
        />
        <ProfileMenuItem
          icon="list"
          title="Moje ogłoszenia"
          subtitle="Aktywne i zakończone"
          delay={500}
          onPress={() => router.push("/profile/offers")}
        />
        <ProfileMenuItem
          icon="wallet"
          title="Historia transakcji"
          delay={600}
          onPress={() => console.log("Portfel")}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Konto</Text>

        <ProfileMenuItem
          icon="settings"
          title="Ustawienia"
          delay={700}
          onPress={() => console.log("Ustawienia")}
        />
        <ProfileMenuItem
          icon="help-circle"
          title="Pomoc i wsparcie"
          delay={800}
          onPress={() => console.log("Pomoc")}
        />
        <ProfileMenuItem
          icon="log-out"
          title="Wyloguj się"
          isDestructive={true}
          delay={900}
          onPress={() => signOut()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
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
    marginBottom: 16,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.status.border,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.background.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
