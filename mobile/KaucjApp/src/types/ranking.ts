export type RankingActivityType =
  | "returned_plastic"
  | "returned_can"
  | "collected_plastic"
  | "collected_can"
  | "returned_total"
  | "collected_total";

export interface RankingQueryParams {
  type?: RankingActivityType;
  days?: number;
  page?: number;
  size?: number;
}

export interface UserStats {
  userId: number;
  username: string;
  profilePictureUrl: string;
  periodDays: number;
  fromDate: string;
  toDate: string;
  returnedPlasticCount: number;
  returnedCanCount: number;
  returnedTotalCount: number;
  collectedPlasticCount: number;
  collectedCanCount: number;
  collectedTotalCount: number;
}
