import { colors, shadows, spacing } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface StatItemProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  valueColor?: string;
  index: number;
  shadowColor?: string;
}

export default function StatItem({
  icon,
  iconBg,
  value,
  label,
  valueColor,
  index,
  shadowColor,
}: StatItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100 + 50).springify()}
      style={styles.statWrapper}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: iconBg, shadowColor: shadowColor },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[styles.valueText, valueColor && { color: valueColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
      <Text style={styles.labelText} numberOfLines={2}>
        {label}
      </Text>
    </Animated.View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  statWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadows.light,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text?.primary || "#1C1C1E",
    marginBottom: 4,
    textAlign: "center",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text?.muted || "#8E8E93",
    textAlign: "center",
  },
});
