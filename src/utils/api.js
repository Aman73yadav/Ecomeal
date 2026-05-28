import { seedInventory } from "./inventory.js";

// In-memory "server" — simulates a real REST/WS backend.
const server = { inventory: null };

function withFlakiness(fn, { failRate = 0.18, maxLatency = 700 } = {}) {
  return (...args) =>
    new Promise((resolve, reject) => {
      const latency = Math.random() * maxLatency;
      setTimeout(() => {
        if (Math.random() < failRate) return reject(new Error("Network/API failure (simulated)"));
        resolve(fn(...args));
      }, latency);
    });
}

export const api = {
  fetchInventory: withFlakiness(() => {
    if (!server.inventory) server.inventory = seedInventory();
    return server.inventory.map((it) =>
      Math.random() < 0.02 ? { ...it, quantity: null, expiry: null } : it
    );
  }),
  pushMutation: withFlakiness((mutation) => {
    if (!server.inventory) server.inventory = seedInventory();
    const list = server.inventory;
    if (mutation.type === "ADJUST_QTY") {
      const it = list.find((x) => x.id === mutation.id);
      if (it) it.quantity = Math.max(0, +(it.quantity + mutation.delta).toFixed(1));
    } else if (mutation.type === "DELETE") {
      server.inventory = list.filter((x) => x.id !== mutation.id);
    } else if (mutation.type === "ADD") {
      list.unshift(mutation.item);
    }
    return { ok: true, appliedAt: Date.now() };
  }, { failRate: 0.25 }),
};

export async function retry(fn, tries = 4, base = 300) {
  let err;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { err = e; await new Promise((r) => setTimeout(r, base * 2 ** i)); }
  }
  throw err;
}

export function makeChannel() {
  try { return new BroadcastChannel("ecomeal-sync"); }
  catch { return null; }
}
