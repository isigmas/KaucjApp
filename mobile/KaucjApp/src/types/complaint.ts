export const COMPLAINT_REASONS = [
  "INVALID_OFFER_CONTENT",
  "TROUBLE_WITH_OTHER_USER",
  "OTHER",
] as const;
export type ComplaintReason = (typeof COMPLAINT_REASONS)[number];
export type Complainant = "CREATOR" | "COLLECTOR";

export interface Complaint {
  complaint_id: number;
  offer_id: number;
  complainant: Complainant;
  complaint_reason: ComplaintReason;
  message: string;
}

export interface ComplaintPayload {
  complaintReason: ComplaintReason;
  message: string;
}

// UI
export const REASON_LABELS: Record<ComplaintReason, string> = {
  INVALID_OFFER_CONTENT: "Nieprawidłowa treść oferty",
  TROUBLE_WITH_OTHER_USER: "Problem z innym użytkownikiem",
  OTHER: "Inne",
};
