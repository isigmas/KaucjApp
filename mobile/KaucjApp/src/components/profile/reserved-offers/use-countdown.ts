import {
  CountdownDisplayInterval,
  formatCountdownLabel,
  getCountdownUrgency,
  getTickInterval,
  getTimeParts,
  parseDateToMs,
  TimeParts,
} from "@/src/lib/countdown";
import { useEffect, useMemo, useState } from "react";

interface UseCountdownArgs {
  expiresAt: string;
  interval?: CountdownDisplayInterval;
}

export function useCountdown({
  expiresAt,
  interval = "seconds",
}: UseCountdownArgs) {
  const targetMs = useMemo(() => parseDateToMs(expiresAt), [expiresAt]);
  const [parts, setParts] = useState<TimeParts>(() => getTimeParts(targetMs));
  const tickInterval = getTickInterval(parts.totalMs, interval);

  useEffect(() => {
    setParts(getTimeParts(targetMs));
  }, [targetMs]);

  useEffect(() => {
    if (!tickInterval) return;

    const id = setInterval(
      () => setParts(getTimeParts(targetMs)),
      tickInterval,
    );
    return () => clearInterval(id);
  }, [targetMs, tickInterval]);

  const urgency = getCountdownUrgency(parts.totalMs);
  const label = formatCountdownLabel(parts, interval);

  return {
    parts,
    urgency,
    label,
    isExpired: urgency === "expired",
  };
}
