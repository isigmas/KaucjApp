import { colors } from "../theme";

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export type CountdownUrgency = "expired" | "critical" | "warning" | "ok";
export type CountdownDisplayInterval = "hours" | "minutes" | "seconds";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function parseDateToMs(date: string): number {
  return new Date(date).getTime();
}

export function getTimeParts(targetMs: number, nowMs = Date.now()): TimeParts {
  const totalMs = Math.max(0, targetMs - nowMs);
  const days = Math.floor(totalMs / DAY);
  const hours = Math.floor((totalMs % DAY) / HOUR);
  const minutes = Math.floor((totalMs % HOUR) / MINUTE);
  const seconds = Math.floor((totalMs % MINUTE) / SECOND);
  return { days, hours, minutes, seconds, totalMs };
}

export function getTickInterval(
  totalMs: number,
  interval: CountdownDisplayInterval = "seconds",
): number | null {
  if (totalMs <= 0) return null;
  if (interval === "hours") return HOUR;
  if (interval === "minutes") return MINUTE;
  return SECOND;
}

export function getCountdownUrgency(totalMs: number): CountdownUrgency {
  if (totalMs <= 0) return "expired";
  if (totalMs < 20 * MINUTE) return "critical";
  if (totalMs < 40 * MINUTE) return "warning";
  return "ok";
}

export function formatCountdownLabel(
  { totalMs }: TimeParts,
  interval: CountdownDisplayInterval = "seconds",
): string {
  if (totalMs <= 0) return "Wygasła";

  const hoursLeft = Math.floor(totalMs / HOUR);
  const minutesLeft = Math.floor((totalMs % HOUR) / MINUTE);
  const secondsLeft = Math.floor((totalMs % MINUTE) / SECOND);

  if (interval === "hours") {
    return `${pad(hoursLeft)}`;
  }

  if (interval === "minutes") {
    return `${pad(hoursLeft)}:${pad(minutesLeft)}`;
  }

  return `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function getCountdownConfig(urgency: CountdownUrgency) {
  switch (urgency) {
    case "ok": {
      return {
        bg: colors.primary.light,
        border: colors.primary.base,
        fg: colors.primary.dark,
      };
    }
    case "warning": {
      return {
        bg: "#FEF3C7", // soft amber
        border: colors.status.warning,
        fg: "#92400E",
      };
    }
    case "critical": {
      return {
        bg: "#FEE2E2", // soft red
        border: colors.status.error,
        fg: "#991B1B",
      };
    }
    case "expired": {
      return {
        bg: colors.background.subtle,
        border: colors.status.border,
        fg: colors.text.secondary,
      };
    }
  }
}
