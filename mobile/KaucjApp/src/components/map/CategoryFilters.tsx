import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme";

/* ── Chip definitions ─────────────────────────────────────────────────── */

interface QuantityChip {
  value: 10 | 20 | 50;
  label: string;
}

interface AttributeChip {
  key: string;
  label: string;
}

const QUANTITY_CHIPS: QuantityChip[] = [
  { value: 10, label: "10+" },
  { value: 20, label: "20+" },
  { value: 50, label: "50+" },
];

const ATTRIBUTE_CHIPS: AttributeChip[] = [
  { key: "no_glass", label: "Bez szkła" },
  { key: "free", label: "Darmowe" },
];

/* ── Props ────────────────────────────────────────────────────────────── */

export type QuantityFilter = 10 | 20 | 50 | null;

export interface CategoryFiltersProps {
  activeQuantity: QuantityFilter;
  onQuantityChange: (value: QuantityFilter) => void;
  activeAttributes: string[];
  onAttributesChange: (attrs: string[]) => void;
}

/* ── Component ────────────────────────────────────────────────────────── */

export function CategoryFilters({
  activeQuantity,
  onQuantityChange,
  activeAttributes,
  onAttributesChange,
}: CategoryFiltersProps) {
  const insets = useSafeAreaInsets();

  const handleQuantity = (value: 10 | 20 | 50) => {
    onQuantityChange(activeQuantity === value ? null : value);
  };

  const handleAttribute = (key: string) => {
    onAttributesChange(
      activeAttributes.includes(key)
        ? activeAttributes.filter((k) => k !== key)
        : [...activeAttributes, key],
    );
  };

  return (
    <View style={[styles.wrapper, { top: insets.top + 8 }]}>
      <View style={styles.row}>
        {QUANTITY_CHIPS.map((chip) => {
          const active = activeQuantity === chip.value;
          return (
            <Chip
              key={chip.value}
              label={chip.label}
              active={active}
              onPress={() => handleQuantity(chip.value)}
            />
          );
        })}

        {ATTRIBUTE_CHIPS.map((chip) => {
          const active = activeAttributes.includes(chip.key);
          return (
            <Chip
              key={chip.key}
              label={chip.label}
              active={active}
              onPress={() => handleAttribute(chip.key)}
            />
          );
        })}
      </View>
    </View>
  );
}

/* ── Chip sub-component ───────────────────────────────────────────────── */

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  const pillStyle: ViewStyle[] = [
    styles.chip,
    active ? styles.chipActive : styles.chipInactive,
  ];

  return (
    <Pressable onPress={onPress} style={pillStyle}>
      <Text
        style={[styles.chipText, active && styles.chipTextActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 20,
    overflow: "hidden",
  },
  chipInactive: {
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  chipActive: {
    backgroundColor: colors.primary.base,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    flexShrink: 1,
  },
  chipTextActive: {
    color: colors.text.white,
  },
});
