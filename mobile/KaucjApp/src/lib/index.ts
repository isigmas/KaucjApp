import {
  Complainant,
  ComplaintReason,
  DepositMachineStatus,
  Offer,
  OfferStatus,
} from "@/src/types";
import { colors } from "../theme";
export * from "./map-box";
export * from "./countdown";
import { formatDistanceToNow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const getMachineStatusConfig = (status: DepositMachineStatus) => {
  switch (status) {
    case "AVAILABLE":
      return {
        color: colors.primary.base,
        shadow: "rgba(33, 150, 243, 0.4)",
        label: "Dostępny",
      };
    case "FULL":
      return {
        color: colors.status.warning,
        shadow: "rgba(255, 152, 0, 0.4)",
        label: "Przepełniony",
      };
    case "OUT_OF_ORDER":
      return {
        color: colors.status.error,
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
      return { color: colors.status.warning, label: "Zarezerwowana" };
    case "COMPLETED":
      return { color: colors.accent.base, label: "Zakończona" };
    case "CANCELED":
      return { color: colors.text.secondary, label: "Anulowana" };
    case "PENDING_CONFIRMATION":
      return { color: colors.primary.base, label: "Czeka na potwierdzenie" };
    case "COMPLAINT":
      return { color: colors.status.error, label: "Zgłoszono problem" };
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

export const formatDate = (
  dateString: string,
  getOnlyYear: boolean = false,
) => {
  const date = new Date(dateString);
  if (getOnlyYear) {
    return date.getFullYear().toString();
  } else {
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export const timeAgoInPolish = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true, //adds "temu" at the end
      locale: pl,
    });
  } catch (error) {
    console.error("Invalid date string:", dateString);
    return "";
  }
};

export const formatHour = (time: string) => {
  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
};

export const formatPrice = (value: number) => {
  return `${value.toFixed(2).replace(".", ",")}zł`;
};

export const getPolishPackageQuantity = (
  n: number,
  showNumber: boolean = false,
) => {
  if (n === 1) return "jedno opakowanie kaucyjne";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return showNumber ? n + " opakowania kaucyjne" : "opakowania kaucyjne";
  }
  return showNumber ? n + " opakowań kaucyjnych" : "opakowań kaucyjnych";
};

export const getPolishPickupsCount = (n: number) => {
  if (n === 1) return "jeden odbiór";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return n + " odbiory";
  }
  return n + " odbiorów";
};

export const getPolishRatingCount = (n: number) => {
  if (n === 0) return "brak opinii";
  if (n === 1) return "jedna opinia";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return n + " opinie";
  }
  return n + " opinii";
};

export const getComplaintReasonLabel = (
  reason: ComplaintReason,
  complainiant: Complainant,
): string => {
  switch (reason) {
    case "INVALID_OFFER_CONTENT":
      return "Nieprawidłowa treść oferty";
    case "TROUBLE_WITH_OTHER_USER":
      return complainiant === "COLLECTOR"
        ? "Problem z wystawiającym ofertę"
        : "Problem z kurierem";
    case "OTHER":
      return "Inne";
  }
};
