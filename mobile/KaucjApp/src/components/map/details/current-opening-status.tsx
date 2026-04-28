import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { OpeningHour } from "@/src/types";
import { colors, spacing } from "@/src/theme";
import { formatHour, getDayName } from "@/src/lib";

type OpenStatus = { isOpen: boolean; text: string };

function getCurrentOpenStatus(openingHours: OpeningHour[]): OpenStatus | null {
  if (!openingHours || openingHours.length === 0) return null;

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const today = openingHours.find((h) => h.dayOfWeek === currentDayOfWeek);

  if (
    today &&
    currentTime >= today.openTime &&
    currentTime < today.closeTime &&
    !today.isClosed
  ) {
    return { isOpen: true, text: `Otwarte do ${formatHour(today.closeTime)}` };
  }

  if (today && currentTime < today.openTime) {
    return {
      isOpen: false,
      text: `Zamknięte do ${formatHour(today.openTime)} (${getDayName(today.dayOfWeek)})`,
    };
  }

  for (let i = 1; i <= 7; i++) {
    const nextDayOfWeek = ((currentDayOfWeek + i - 1) % 7) + 1;
    const nextDay = openingHours.find((h) => h.dayOfWeek === nextDayOfWeek);
    if (nextDay && !nextDay.isClosed) {
      return {
        isOpen: false,
        text: `Zamknięte do ${formatHour(nextDay.openTime)} (${getDayName(nextDay.dayOfWeek)})`,
      };
    }
  }

  return { isOpen: false, text: "Obecnie zamknięte" };
}

export default function CurrentOpeningStatus({
  openingHours,
}: {
  openingHours: OpeningHour[];
}) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getCurrentOpenStatus(openingHours));

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [openingHours]);

  if (!status) return null;

  return (
    <Text
      style={[
        styles.statusText,
        { color: status.isOpen ? colors.status.success : colors.status.error },
      ]}
    >
      {status.text}
    </Text>
  );
}

const styles = StyleSheet.create({
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});
