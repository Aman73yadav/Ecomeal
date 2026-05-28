export const THEMES = {
  dark: {
    "--bg": "#0d1117", "--panel": "#161b22", "--card": "#1c2230",
    "--border": "#2a3242", "--text": "#e6edf3", "--muted": "#8b949e",
    "--accent": "#f59e0b", "--ok": "#10b981", "--warn": "#f59e0b",
    "--crit": "#ef4444", "--accent2": "#38bdf8",
  },
  light: {
    "--bg": "#f5f6f8", "--panel": "#ffffff", "--card": "#ffffff",
    "--border": "#e2e5ea", "--text": "#161b22", "--muted": "#5b6472",
    "--accent": "#d97706", "--ok": "#059669", "--warn": "#d97706",
    "--crit": "#dc2626", "--accent2": "#0284c7",
  },
};

export const CATEGORIES = [
  "Vegetables", "Dairy", "Meat", "Seafood", "Grains", "Spices", "Bakery", "Beverages",
];

export const NAMES = {
  Vegetables: ["Mushrooms", "Tomatoes", "Spinach", "Onions", "Bell Peppers", "Carrots", "Potatoes", "Lettuce"],
  Dairy: ["Paneer", "Milk", "Cheese", "Butter", "Yogurt", "Cream"],
  Meat: ["Chicken Breast", "Mutton", "Bacon", "Sausage"],
  Seafood: ["Prawns", "Salmon", "Pomfret", "Crab"],
  Grains: ["Basmati Rice", "Wheat Flour", "Lentils", "Chickpeas"],
  Spices: ["Garam Masala", "Turmeric", "Cumin", "Saffron"],
  Bakery: ["Bread Loaf", "Burger Buns", "Croissant"],
  Beverages: ["Orange Juice", "Cola Syrup", "Cold Brew"],
};

export const UNITS = ["kg", "L", "packs", "units"];

export const SEV_META = {
  expired: { label: "Expired", color: "var(--crit)" },
  critical: { label: "Critical", color: "var(--crit)" },
  warning: { label: "Warning", color: "var(--warn)" },
  soon: { label: "Soon", color: "var(--accent2)" },
  ok: { label: "OK", color: "var(--ok)" },
};

export const ROW_H = 44;
export const VIEWPORT_H = 460;
