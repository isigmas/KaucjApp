export interface UserRating {
  userId: number;
  avgScore: number;
  feedbackCount: number;
}

export interface UserReviewPayload {
  offerId: number;
  score: number;
  comment?: string;
}

export interface MachineReviewPayload {
  reviewerUsername: string;
  score: number;
  comment?: string;
}

export interface Review {
  reviewId: number;
  reviewerId: number;
  reviewerUsername: string;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
