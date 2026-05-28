import { CATEGORIES, NAMES, UNITS } from "../constants/index.js";

export function daysFromNow(d) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
}

export function seedInventory(n = 1100) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const pool = NAMES[cat];
    const name = pool[Math.floor(Math.random() * pool.length)];
    const expOffset = Math.floor(Math.random() * 40) - 4;
    items.push({
      id: `INV-${1000 + i}`,
      name,
      category: cat,
      quantity: +(Math.random() * 50 + 1).toFixed(1),
      unit: UNITS[Math.floor(Math.random() * UNITS.length)],
      expiry: daysFromNow(expOffset),
      costPerUnit: +(Math.random() * 400 + 20).toFixed(0),
    });
  }
  return items;
}

export function daysToExpiry(expiry) {
  const ms = new Date(expiry) - new Date();
  return Math.ceil(ms / 86400000);
}

export function severityOf(item) {
  const d = daysToExpiry(item.expiry);
  if (d < 0) return "expired";
  if (d <= 1) return "critical";
  if (d <= 3) return "warning";
  if (d <= 7) return "soon";
  return "ok";
}

// Smart score: closer expiry + higher quantity + higher cost = act first.
export function priorityScore(item) {
  const d = daysToExpiry(item.expiry);
  const urgency = d < 0 ? 100 : Math.max(0, 100 - d * 12);
  const value = item.quantity * item.costPerUnit;
  return Math.round(urgency * 0.7 + Math.min(value / 50, 60) * 0.3);
}
