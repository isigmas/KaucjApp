export interface Rating {
  userId: number;
  avgScore: number;
  feedbackCount: number;
}

export interface RatingPayload {
  score: number;
  // message: string;
}
