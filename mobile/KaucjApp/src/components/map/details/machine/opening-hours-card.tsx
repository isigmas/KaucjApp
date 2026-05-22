import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OpeningHour } from "@/src/types";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { formatHour, getDayName } from "@/src/lib";
import SectionCard from "../../../ui/section-card";
import SectionTitle from "../card-title";
import ExpandableCard from "@/src/components/ui/expandable-card";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Clock } from "lucide-react-native";

interface OpeningHoursCardProps {
  openingHours: OpeningHour[];
}

export default function OpeningHoursCard({
  openingHours,
}: OpeningHoursCardProps) {
  const sorted = [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const today = openingHours.find((h) => h.dayOfWeek === currentDayOfWeek);
  const subtitle = today
    ? "Dzisiaj: " +
      formatHour(today.openTime) +
      " - " +
      formatHour(today.closeTime)
    : "Pokaż więcej";

  return (
    <Animated.View style={styles.shadow}>
      <ExpandableCard
        title="Godziny otwarcia"
        subtitle={subtitle}
        icon={<Clock size={28} strokeWidth={2} color={colors.accent.base} />}
        titleStyle={styles.openingHoursTitle}
        style={styles.card}
        entering={FadeInDown.delay(300).springify()}
      >
        {sorted.map((day) => (
          <View style={styles.row} key={day.dayOfWeek}>
            <Text style={styles.dayText}>{getDayName(day.dayOfWeek)}</Text>
            {day.isClosed ? (
              <Text style={styles.closedText}>zamknięte</Text>
            ) : (
              <Text style={styles.hoursText}>
                {formatHour(day.openTime)} - {formatHour(day.closeTime)}
              </Text>
            )}
          </View>
        ))}
      </ExpandableCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...shadows.light,
  },
  card: {
    borderRadius: rounded.apple,
    borderWidth: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  dayText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  hoursText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  closedText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  openingHoursTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textTransform: "uppercase",
  },
});
