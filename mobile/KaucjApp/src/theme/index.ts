export const colors = {
  primary: {
    base: "#10B981", // Emerald Green (Primary Actions & Seller Pins)
    dark: "#047857", // Forest Green (Pressed states & Dark Text)
    light: "#D1FAE5", // Mint Tint (Badge backgrounds & Highlight)
  },

  accent: {
    base: "#0EA5E9", // Ocean Blue (Deposit Points & Informational icons)
    dark: "#0369A1", // Deep Water (Navigation focus)
    light: "#E0F2FE", // Sky (Subtle UI borders)
  },

  background: {
    main: "#F8FAF8", // Eco Off-White (The canvas of the app)
    card: "#FFFFFF", // Pure White (Cards, Bottom Sheets, Modals)
    subtle: "#F3F4F6", // Light Gray (Input backgrounds)
  },

  text: {
    primary: "#111827", // Charcoal (High readability)
    secondary: "#6B7280", // Slate Gray (Captions & Distances)
    muted: "#9CA3AF", // Light Gray (Placeholders)
    white: "#FFFFFF", // Text on Primary buttons
  },

  status: {
    success: "#10B981",
    error: "#EF4444", // Soft Red (Cancelations/Alerts)
    warning: "#F59E0B", // Amber (Low stock / Pending payment)
    border: "#E5E7EB", // Hairline dividers
  },
} as const;

export type AppColors = typeof colors;
