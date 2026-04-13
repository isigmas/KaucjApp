export type MachineStatus = "AVAILABLE" | "FULL" | "OUT_OF_ORDER";

export interface DepositMachine {
  id: number;
  retailNetworkId: number;
  status: MachineStatus;
  address: string;
  latitude: number;
  longitude: number;
}

export interface OpeningHour {
  depositMachineId: number;
  dayOfWeek: number; // 1 = Poniedziałek, 7 = Niedziela
  openTime: string;
  closeTime: string;
}

export const depositMachines: DepositMachine[] = [
  {
    id: 1,
    retailNetworkId: 2,
    status: "AVAILABLE",
    address: "ul. Pawia 5, 31-154 Kraków",
    latitude: 50.06465,
    longitude: 19.94498,
  },
  {
    id: 2,
    retailNetworkId: 3,
    status: "FULL",
    address: "ul. Grzegórzecka 67, 31-559 Kraków",
    latitude: 50.0583,
    longitude: 19.9555,
  },
  {
    id: 3,
    retailNetworkId: 1,
    status: "OUT_OF_ORDER",
    address: "ul. Karmelicka 22, 31-128 Kraków",
    latitude: 50.0655,
    longitude: 19.933,
  },
  {
    id: 4,
    retailNetworkId: 4,
    status: "AVAILABLE",
    address: "ul. Bratysławska 4, 31-201 Kraków",
    latitude: 50.0833,
    longitude: 19.9366,
  },
  {
    id: 5,
    retailNetworkId: 6,
    status: "AVAILABLE",
    address: "ul. Stawowa 61, 31-346 Kraków",
    latitude: 50.0875,
    longitude: 19.8972,
  },
];

export const mockOpeningHours: OpeningHour[] = [
  // 1. Biedronka (Pon-Sob 06:00 - 23:00, brak niedzieli)
  {
    depositMachineId: 1,
    dayOfWeek: 1,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 1,
    dayOfWeek: 2,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 1,
    dayOfWeek: 3,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 1,
    dayOfWeek: 4,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 1,
    dayOfWeek: 5,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 1,
    dayOfWeek: 6,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },

  // 2. Lidl (Pon-Sob 06:00 - 22:00, brak niedzieli)
  {
    depositMachineId: 2,
    dayOfWeek: 1,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 2,
    dayOfWeek: 2,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 2,
    dayOfWeek: 3,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 2,
    dayOfWeek: 4,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 2,
    dayOfWeek: 5,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 2,
    dayOfWeek: 6,
    openTime: "06:00:00",
    closeTime: "22:00:00",
  },

  // 3. Żabka (Pon-Niedz 06:00 - 23:00)
  {
    depositMachineId: 3,
    dayOfWeek: 1,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 2,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 3,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 4,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 5,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 6,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },
  {
    depositMachineId: 3,
    dayOfWeek: 7,
    openTime: "06:00:00",
    closeTime: "23:00:00",
  },

  // 4. Kaufland (Pon-Sob 07:00 - 22:00)
  {
    depositMachineId: 4,
    dayOfWeek: 1,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 4,
    dayOfWeek: 2,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 4,
    dayOfWeek: 3,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 4,
    dayOfWeek: 4,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 4,
    dayOfWeek: 5,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 4,
    dayOfWeek: 6,
    openTime: "07:00:00",
    closeTime: "22:00:00",
  },

  // 5. Auchan (Pon-Sob 08:00 - 22:00)
  {
    depositMachineId: 5,
    dayOfWeek: 1,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 5,
    dayOfWeek: 2,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 5,
    dayOfWeek: 3,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 5,
    dayOfWeek: 4,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 5,
    dayOfWeek: 5,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
  {
    depositMachineId: 5,
    dayOfWeek: 6,
    openTime: "08:00:00",
    closeTime: "22:00:00",
  },
];
