import { colors, rounded, spacing } from "@/src/theme";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type OffersTab = "active" | "history";

interface OffersTabSwitcherProps {
  active: OffersTab;
  onChange: (tab: OffersTab) => void;
  activeCount?: number;
  historyCount?: number;
}

export default function OffersTabSwitcher({
  active,
  onChange,
  activeCount,
  historyCount,
}: OffersTabSwitcherProps) {
  const [innerWidth, setInnerWidth] = useState(0);
  const activeIndex = TABS.findIndex((t) => t.id === active);
  const offset = useSharedValue(activeIndex);

  useEffect(() => {
    offset.value = withSpring(activeIndex, {
      damping: 22,
      stiffness: 240,
      mass: 0.6,
    });
  }, [activeIndex, offset]);

  const segmentWidth = innerWidth / TABS.length;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * segmentWidth }],
    opacity: innerWidth > 0 ? 1 : 0,
  }));

  const handlePress = (tab: OffersTab) => {
    if (tab === active) return;
    Haptics.selectionAsync();
    onChange(tab);
  };

  const counts: Record<OffersTab, number | undefined> = {
    active: activeCount,
    history: historyCount,
  };

  return (
    <View
      style={styles.track}
      onLayout={(e) =>
        setInnerWidth(e.nativeEvent.layout.width - TRACK_PADDING * 2)
      }
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.thumb, { width: segmentWidth }, thumbStyle]}
      />

      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const count = counts[tab.id];
        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.segment,
              pressed && !isActive && styles.segmentPressed,
            ]}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {typeof count === "number" && (
              <View
                style={[
                  styles.badge,
                  isActive ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isActive
                      ? styles.badgeTextActive
                      : styles.badgeTextInactive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const TABS: { id: OffersTab; label: string }[] = [
  { id: "active", label: "Aktywne" },
  { id: "history", label: "Historia" },
];

const TRACK_PADDING = spacing.xs; //this is defined here because the layout uses absolute positioning so it has to be consistent

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.pill,
    padding: TRACK_PADDING,
    borderWidth: 1,
    borderColor: colors.status.border,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    backgroundColor: colors.background.card,
    borderRadius: rounded.pill,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    gap: 6,
    borderRadius: rounded.pill,
  },
  segmentPressed: {
    opacity: 0.65,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.text.primary,
    fontWeight: "700",
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: rounded.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    backgroundColor: colors.primary.light,
  },
  badgeInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.status.border,
    opacity: 0.65,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  badgeTextActive: {
    color: colors.primary.dark,
  },
  badgeTextInactive: {
    color: colors.text.secondary,
  },
});
