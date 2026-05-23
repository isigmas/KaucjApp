import { layoutSpring } from "@/src/constants";
import { formatPrice } from "@/src/lib";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { DEPOSIT_VALUE_PER_UNIT } from "@/src/validation";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import StatItem from "./stat-item";
import { User } from "@/src/types/user";

interface UserStatsProps {
  user: User;
}

export default function UserStats({ user }: UserStatsProps) {
  const [activeTab, setActiveTab] = useState<"collected" | "returned">(
    "collected",
  );

  const totalReturnedDepositValue =
    user.returnedTotalCount * DEPOSIT_VALUE_PER_UNIT;
  const totalCollectedDepositValue =
    user.collectedTotalCount * DEPOSIT_VALUE_PER_UNIT;

  const isCollected = activeTab === "collected";

  return (
    <View style={styles.userStatsContainer}>
      <View style={styles.segmentedControl}>
        <Animated.View
          layout={layoutSpring}
          style={[
            styles.activeSegmentIndicator,
            { left: isCollected ? "1%" : "51%" },
          ]}
        />
        <Pressable
          style={styles.segmentButton}
          onPress={() => setActiveTab("collected")}
        >
          <Text
            style={[
              styles.segmentText,
              isCollected && styles.segmentTextActive,
            ]}
          >
            Jako Kurier
          </Text>
        </Pressable>
        <Pressable
          style={styles.segmentButton}
          onPress={() => setActiveTab("returned")}
        >
          <Text
            style={[
              styles.segmentText,
              !isCollected && styles.segmentTextActive,
            ]}
          >
            Jako Oddający
          </Text>
        </Pressable>
      </View>

      <View style={styles.statsGridContainer}>
        {isCollected ? (
          <Animated.View
            key="collected-stats"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.userStatsWrapper}
          >
            <StatItem
              index={1}
              icon={
                <Ionicons name="water" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={user.collectedBottleCount.toString()}
              label="Butelki"
              shadowColor={colors.text.primary}
            />
            <StatItem
              index={2}
              icon={
                <Ionicons name="water" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={user.collectedCanCount.toString()}
              label="Puszki"
              shadowColor={colors.accent.base}
            />
            <StatItem
              index={3}
              icon={
                <Ionicons name="wallet" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={formatPrice(totalCollectedDepositValue)}
              label="Wartość"
              shadowColor={colors.text.primary}
            />
          </Animated.View>
        ) : (
          <Animated.View
            key="returned-stats"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.userStatsWrapper}
          >
            <StatItem
              index={1}
              icon={
                <Ionicons name="water" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={user.returnedBottleCount.toString()}
              label="Butelki"
              shadowColor={colors.text.primary}
            />
            <StatItem
              index={2}
              icon={
                <Ionicons name="water" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={user.returnedCanCount.toString()}
              label="Puszki"
              shadowColor={colors.accent.base}
            />
            <StatItem
              index={3}
              icon={
                <Ionicons name="wallet" size={16} color={colors.text.primary} />
              }
              iconBg={colors.background.card}
              value={formatPrice(totalReturnedDepositValue)}
              label="Wartość"
              shadowColor={colors.text.primary}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userStatsContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  segmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.background.card || "#F2F2F7",
    borderRadius: rounded.apple,
    padding: 4,
    width: "100%",
    marginBottom: spacing.lg,
    position: "relative",
  },
  activeSegmentIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: rounded.apple,
    ...shadows.light,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.muted || "#8E8E93",
  },
  segmentTextActive: {
    color: colors.text.primary || "#1C1C1E",
  },

  statsGridContainer: {
    width: "100%",
    justifyContent: "center",
  },
  userStatsWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.light || "#E8F5E9",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    width: "100%",
    marginTop: spacing.sm,
    shadowColor: colors.accent.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryTextWrapper: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.muted || "#666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.accent.dark || "#2E7D32",
  },
});
