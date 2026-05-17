export interface Rating {
  userId: number;
  avgScore: number;
  feedbackCount: number;
}

export interface RatingPayload {
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
