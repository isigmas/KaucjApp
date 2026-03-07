export interface BottleItem {
  bottle_id: number;
  quantity: number;
  price: number;
}

export interface Offer {
  offer_id: number;
  status: "open" | "reserved" | "completed";
  latitude: number;
  longitude: number;
  address: string;
  pickup_info: string;
  user: { user_id: number; username: string };
  items: BottleItem[];
  created_at: string;
}

export const MOCK_ADS: Offer[] = [
  {
    offer_id: 1,
    status: "open",
    latitude: 50.065,
    longitude: 19.921,
    address: "ul. Floriańska 12, Kraków",
    pickup_info: "Brama od podwórka, domofon 3",
    user: { user_id: 1, username: "kasia_w" },
    items: [
      { bottle_id: 1, quantity: 30, price: 0.5 },
      { bottle_id: 2, quantity: 20, price: 0.25 },
    ],
    created_at: "2026-03-06T10:00:00Z",
  },
  {
    offer_id: 2,
    status: "open",
    latitude: 50.0665,
    longitude: 19.9185,
    address: "ul. Grodzka 40, Kraków",
    pickup_info: "Sklep na parterze, pytać o Marka",
    user: { user_id: 2, username: "marek_t" },
    items: [{ bottle_id: 3, quantity: 32, price: 0.25 }],
    created_at: "2026-03-06T11:30:00Z",
  },
  {
    offer_id: 3,
    status: "open",
    latitude: 50.0615,
    longitude: 19.93,
    address: "os. Podwawelskie 7, Kraków",
    pickup_info: "Klatka B, 2 piętro",
    user: { user_id: 3, username: "ania_k" },
    items: [
      { bottle_id: 4, quantity: 40, price: 0.5 },
      { bottle_id: 5, quantity: 15, price: 0.25 },
      { bottle_id: 6, quantity: 5, price: 1.0 },
    ],
    created_at: "2026-03-05T09:15:00Z",
  },
  {
    offer_id: 4,
    status: "reserved",
    latitude: 50.063,
    longitude: 19.924,
    address: "ul. Karmelicka 22, Kraków",
    pickup_info: "Garaż podziemny, miejsce 14",
    user: { user_id: 4, username: "tomek_r" },
    items: [{ bottle_id: 7, quantity: 25, price: 0.25 }],
    created_at: "2026-03-06T14:00:00Z",
  },
  {
    offer_id: 5,
    status: "open",
    latitude: 50.068,
    longitude: 19.926,
    address: "ul. Długa 55, Kraków",
    pickup_info: "Portiernia, odbiór 8-20",
    user: { user_id: 5, username: "ola_s" },
    items: [
      { bottle_id: 8, quantity: 50, price: 0.5 },
      { bottle_id: 9, quantity: 30, price: 0.25 },
    ],
    created_at: "2026-03-04T16:45:00Z",
  },
];

export const DEFAULT_REGION = {
  latitude: 50.0647,
  longitude: 19.923,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
} as const;