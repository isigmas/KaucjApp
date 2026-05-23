export type DepositMachineStatus = "AVAILABLE" | "OUT_OF_ORDER" | "FULL";

export interface OpeningHour {
  dayOfWeek: number; // 1 = monday, 7 = sunday
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

// GET DTO
export interface DepositMachine {
  id: number;
  networkName: string;
  status: DepositMachineStatus;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: OpeningHour[];

  avgScore: number;
  feedbackCount: number;
}

// GET /api/deposit/search
export interface MachineSearchBBox {
  swLat: number;
  swLon: number;
  neLat: number;
  neLon: number;
}
