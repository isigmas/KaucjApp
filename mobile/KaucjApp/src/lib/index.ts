export * from "./map-box";

import { DepositMachineStatus, OfferStatus } from "@/src/types";
import { colors } from "../theme";

export const getMachineStatusConfig = (status: DepositMachineStatus) => {
  switch (status) {
    case "AVAILABLE":
      return {
        color: "#2d8d33",
        shadow: "rgba(33, 150, 243, 0.4)",
        label: "Dostępny",
      };
    case "FULL":
      return {
        color: "#FF9800",
        shadow: "rgba(255, 152, 0, 0.4)",
        label: "Przepełniony",
      };
    case "OUT_OF_ORDER":
      return {
        color: "#F44336",
        shadow: "rgba(244, 67, 54, 0.4)",
        label: "Awaria",
      };
  }
};

export const getOfferStatusConfig = (status: OfferStatus) => {
  switch (status) {
    case "OPEN":
      return { color: colors.primary.base, label: "Otwarta" };
    case "RESERVED":
      return { color: colors.accent.base, label: "Zarezerwowana" };
    case "COMPLETED":
      return { color: colors.status.success, label: "Zakończona" };
    case "CANCELED":
      return { color: colors.status.error, label: "Anulowana" };
  }
};

export const getDayName = (dayOfWeek: number) => {
  if (dayOfWeek < 1 || dayOfWeek > 7) return "Nieznany dzień";
  return [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela",
  ][dayOfWeek - 1];
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatHour = (time: string) => {
  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
};
