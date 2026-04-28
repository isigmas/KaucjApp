import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OpeningHour } from "@/src/types";
import { colors, spacing } from "@/src/theme";
import { formatHour, getDayName } from "@/src/lib";
import SectionCard from "../section-card";
import SectionTitle from "../card-title";

interface OpeningHoursCardProps {
  openingHours: OpeningHour[];
}

export default function OpeningHoursCard({
  openingHours,
}: OpeningHoursCardProps) {
  const sorted = [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <SectionCard>
      <SectionTitle>Godziny otwarcia</SectionTitle>
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
    </SectionCard>
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
});
