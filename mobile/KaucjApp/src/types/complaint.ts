export type ComplaintReason =
  | "INVALID_OFFER_CONTENT"
  | "TROUBLE_WITH_OTHER_USER"
  | "OTHER";
export type Complainant = "CREATOR" | "COLLECTOR";

export interface Complaint {
  complaint_id: number;
  offer_id: number;
  complainant: Complainant;
  complaint_reason: ComplaintReason;
  message: string;
}

export interface ComplaintPayload {
  complaint_reason: ComplaintReason;
  message: string;
}
