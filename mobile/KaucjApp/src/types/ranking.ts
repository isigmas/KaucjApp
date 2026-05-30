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
