export const COMPLAINT_REASONS = [
  "INVALID_OFFER_CONTENT",
  "TROUBLE_WITH_OTHER_USER",
  "OTHER",
] as const;
export type ComplaintReason = (typeof COMPLAINT_REASONS)[number];
export type Complainant = "CREATOR" | "COLLECTOR";

export interface Complaint {
  complaintId: number;
  offerId: number;
  complainant: Complainant;
  complaintReason: ComplaintReason;
  message: string;
}

export interface ComplaintPayload {
  complaintReason: ComplaintReason;
  message: string;
}
