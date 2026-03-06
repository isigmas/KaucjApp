/**
 * Mock marketplace ads for deposit bottles.
 */

export interface BottleAd {
  id: string;
  title: string;
  pricePLN: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  seller: string;
  bottleCount: number;
}

/** Sample ads near Kraków */
export const MOCK_ADS: BottleAd[] = [
  {
    id: "ad-1",
    title: "Butelki po piwie 0,5 L",
    pricePLN: 12.5,
    coordinate: { latitude: 50.0650, longitude: 19.9210 }, 
    seller: "Kasia W.",
    bottleCount: 50,
  },
  {
    id: "ad-2",
    title: "Butelki szklane 0,33 L",
    pricePLN: 8.0,
    coordinate: { latitude: 50.0665, longitude: 19.9185 }, 
    seller: "Marek T.",
    bottleCount: 32,
  },
  {
    id: "ad-3",
    title: "Butelki PET 1,5 L",
    pricePLN: 15.0,
    coordinate: { latitude: 50.0615, longitude: 19.9300 }, 
    seller: "Ania K.",
    bottleCount: 60,
  },
  {
    id: "ad-4",
    title: "Puszki aluminiowe",
    pricePLN: 6.25,
    coordinate: { latitude: 50.0630, longitude: 19.9240 }, 
    seller: "Tomek R.",
    bottleCount: 25,
  },
  {
    id: "ad-5",
    title: "Mix butelek 0,5 L",
    pricePLN: 20.0,
    coordinate: { latitude: 50.0680, longitude: 19.9260 }, 
    seller: "Ola S.",
    bottleCount: 80,
  },
];

/** Default region to show while user location is loading (Kraków). */
export const DEFAULT_REGION = {
  latitude: 50.0647,
  longitude: 19.9230,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
} as const;