import { layoutSpring } from "@/src/constants";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { MapFilter as MapFilterValue } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface FilterOption {
  id: MapFilterValue;
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const OPTIONS: readonly FilterOption[] = [
  {
    id: "all",
    label: "Wszystko",
    icon: "layers-outline",
    activeIcon: "layers",
  },
  {
    id: "offers",
    label: "Oferty",
    icon: "pricetag-outline",
    activeIcon: "pricetag",
  },
  {
    id: "machines",
    label: "Kaucjomaty",
    icon: "cube-outline",
    activeIcon: "cube",
  },
] as const;

interface MapFilterProps {
  value: MapFilterValue;
  onChange: (value: MapFilterValue) => void;
}

function MapFilter({ value, onChange }: MapFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const handleActivePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => !prev);
  };

  const handleSelect = (id: MapFilterValue) => {
    if (id !== value) {
      Haptics.selectionAsync();
      onChange(id);
    }
    setExpanded(false);
  };

  return (
    <Animated.View
      layout={layoutSpring}
      style={styles.shadowWrap}
      accessibilityRole="tablist"
    >
      {OPTIONS.map((option) => {
        const isActive = option.id === value;

        if (!expanded && !isActive) return null;

        return (
          <Animated.View
            key={option.id}
            layout={layoutSpring}
            entering={isActive ? undefined : FadeIn.duration(160)}
            exiting={isActive ? undefined : FadeOut.duration(120)}
          >
            <FilterChip
              option={option}
              isActive={isActive}
              expanded={expanded}
              onPress={() =>
                isActive ? handleActivePress() : handleSelect(option.id)
              }
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

export default React.memo(MapFilter);

interface FilterChipProps {
  option: FilterOption;
  isActive: boolean;
  expanded: boolean;
  onPress: () => void;
}

function FilterChip({ option, isActive, expanded, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={
        isActive && !expanded
          ? `Filtr: ${option.label}. Dotknij, aby zmienić`
          : option.label
      }
      accessibilityState={{ selected: isActive, expanded }}
      style={({ pressed }) => [
        styles.chip,
        isActive ? styles.chipActive : styles.chipInactive,
        pressed && styles.chipPressed,
      ]}
    >
      {isActive && <Chevron expanded={expanded} />}

      <Text
        style={[styles.label, isActive && styles.labelActive]}
        numberOfLines={1}
      >
        {option.label}
      </Text>

      <Ionicons
        name={isActive ? option.activeIcon : option.icon}
        size={16}
        color={isActive ? colors.text.white : colors.text.secondary}
      />
    </Pressable>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(expanded ? 1 : 0, {
      damping: 18,
      stiffness: 220,
      mass: 0.6,
    });
  }, [expanded, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="chevron-back" size={14} color={colors.text.white} />
    </Animated.View>
  );
}

const TRACK_PADDING = 4;

const styles = StyleSheet.create({
  shadowWrap: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    gap: 2,
    padding: TRACK_PADDING,
    borderRadius: rounded.pill,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.status.border,
    ...shadows.medium,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: spacing.md - 2,
    gap: 6,
    borderRadius: rounded.pill,
  },
  chipActive: {
    backgroundColor: colors.primary.base,
    ...shadows.light,
  },
  chipInactive: {
    backgroundColor: "transparent",
  },
  chipPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.text.white,
    fontWeight: "700",
  },
});
