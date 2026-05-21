import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OpeningHour } from "@/src/types";
import { colors, spacing } from "@/src/theme";
import { formatHour, getDayName } from "@/src/lib";
import SectionCard from "../../../ui/section-card";
import SectionTitle from "../card-title";
import ExpandableCard from "@/src/components/ui/expandable-card";
import { Ionicons } from "@expo/vector-icons";

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
    <ExpandableCard
      title="Godziny otwarcia"
      subtitle={subtitle}
      icon={
        <Ionicons name="time-outline" size={24} color={colors.text.primary} />
      }
      titleStyle={styles.openingHoursTitle}
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
  );
}

const styles = StyleSheet.create({
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
