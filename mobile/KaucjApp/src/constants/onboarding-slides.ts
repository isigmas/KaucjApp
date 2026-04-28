import { OnboardingData } from "@/src/types";

export const ONBOARDING_SLIDES: OnboardingData[] = [
  {
    id: "1",
    title: "Odkrywaj okolicę",
    description:
      "Znajdź najbliższe kaucjomaty i łap najlepsze oferty ze swojego sąsiedztwa.",
    animation: require("../../assets/animations/earth-map.json"),
  },
  {
    id: "2",
    title: "Oszczędzaj czas",
    description:
      "Wystaw opakowania i pozwól, aby ktoś inny zwrócił je za Ciebie.",
    animation: require("../../assets/animations/courier.json"),
  },
  {
    id: "3",
    title: "Bądź lepszy!",
    description:
      "Przyłóż się do ochrony środowiska oraz wspieraj lokalną społeczność",
    animation: require("../../assets/animations/profit.json"),
  },
];
