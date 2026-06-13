import { layoutSpring } from "@/src/constants";
import { colors, rounded, spacing } from "@/src/theme";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  EntryOrExitLayoutType,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  entering?: EntryOrExitLayoutType;
}

export default function ExpandableCard({
  title,
  subtitle,
  icon,
  defaultExpanded = false,
  children,
  titleStyle,
  style,
  entering,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const progress = useSharedValue(defaultExpanded ? 1 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(progress.value - 1) * 90}deg` }],
  }));

  const toggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withSpring(next ? 1 : 0, {
      damping: 20,
      stiffness: 220,
      mass: 0.6,
    });
    Haptics.selectionAsync().catch(() => {});
  }, [expanded, progress]);

  return (
    <Animated.View
      layout={layoutSpring}
      style={[styles.wrapper, style]}
      entering={entering}
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        android_ripple={{ color: colors.primary.light }}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed,
        ]}
      >
        {icon && <View style={styles.iconChip}>{icon}</View>}

        <View style={styles.titleColumn}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={colors.text.secondary} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(420)}
          exiting={FadeOut.duration(140)}
          style={styles.body}
        >
          <View style={styles.divider} />
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  headerPressed: {
    backgroundColor: colors.background.subtle,
  },
  iconChip: {
    width: 36,
    height: 36,

    borderRadius: rounded.xl,

    alignItems: "center",
    justifyContent: "center",
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  trailing: {
    marginRight: 2,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    marginBottom: spacing.md,
    opacity: 0.7,
  },
});
