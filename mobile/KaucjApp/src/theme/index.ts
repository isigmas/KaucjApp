export const colors = {
  primary: {
    base: "#589469", // Sage Green (Primary Actions & Seller Pins)
    dark: "#3A5A46", // Deep Pine (Pressed states & Dark Text)
    light: "#EAF0EC", // Morning Dew (Badge backgrounds & Highlight)
  },

  accent: {
    base: "#7393A7", // Lake Slate Blue (Deposit Points & Informational icons)
    dark: "#4A6678", // Deep Water (Navigation focus)
    light: "#EDF2F5", // Mist (Subtle UI borders)
  },

  background: {
    main: "#F6F7F4", // Oat/Birch Off-White (The warm, natural canvas of the app)
    card: "#FFFFFF", // Pure White (Cards, Bottom Sheets, Modals to maintain contrast)
    subtle: "#EAECE8", // Light Stone (Input backgrounds)
  },

  black: {
    default: "#1F2924", // Deep Canopy Green-Black (Primary text & Icons - softer than pure black)
  },

  text: {
    primary: "#2C3631", // Dark Bark (High readability, less eye strain)
    secondary: "#707A74", // Mossy Gray (Captions & Distances)
    muted: "#A3ACA7", // Lichen Gray (Placeholders)
    white: "#FFFFFF", // Text on Primary buttons
  },

  status: {
    success: "#5B8266", // Matches Primary Sage
    error: "#C86A58", // Terracotta/Clay (Softer, less panic-inducing than pure red)
    warning: "#D4A373", // Warm Sand (Low stock / Pending payment)
    border: "#DCE0DA", // Subtle Twig Gray (Hairline dividers)
  },
} as const;

//#606342 - ciekawy kolor gdzieś znalazłem

export type AppColors = typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16, // Default screen padding
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const rounded = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  apple: 32,
  pill: 9999,
};
