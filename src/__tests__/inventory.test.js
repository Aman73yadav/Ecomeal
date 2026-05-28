import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { daysToExpiry, severityOf, priorityScore, daysFromNow, seedInventory } from '../utils/inventory.js';

describe('daysToExpiry', () => {
  it('returns a negative number for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(daysToExpiry(yesterday.toISOString().slice(0, 10))).toBeLessThan(0);
  });

  it('returns a positive number for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    expect(daysToExpiry(tomorrow.toISOString().slice(0, 10))).toBeGreaterThan(0);
  });

  it('returns ~0 for today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(Math.abs(daysToExpiry(today))).toBeLessThanOrEqual(1);
  });
});

describe('severityOf', () => {
  it('returns "expired" when expiry is in the past', () => {
    expect(severityOf({ expiry: daysFromNow(-2) })).toBe('expired');
  });

  it('returns "critical" when expiry is within 1 day', () => {
    expect(severityOf({ expiry: daysFromNow(1) })).toBe('critical');
  });

  it('returns "warning" when expiry is within 3 days', () => {
    expect(severityOf({ expiry: daysFromNow(3) })).toBe('warning');
  });

  it('returns "soon" when expiry is within 7 days', () => {
    expect(severityOf({ expiry: daysFromNow(6) })).toBe('soon');
  });

  it('returns "ok" when expiry is far in the future', () => {
    expect(severityOf({ expiry: daysFromNow(30) })).toBe('ok');
  });
});

describe('priorityScore', () => {
  it('scores expired item higher than a future item', () => {
    const expired = { expiry: daysFromNow(-1), quantity: 10, costPerUnit: 100 };
    const fresh = { expiry: daysFromNow(20), quantity: 10, costPerUnit: 100 };
    expect(priorityScore(expired)).toBeGreaterThan(priorityScore(fresh));
  });

  it('scores higher-value item higher than a low-value item at same expiry', () => {
    const expiry = daysFromNow(2);
    const expensive = { expiry, quantity: 50, costPerUnit: 400 };
    const cheap = { expiry, quantity: 1, costPerUnit: 20 };
    expect(priorityScore(expensive)).toBeGreaterThan(priorityScore(cheap));
  });

  it('returns a non-negative number', () => {
    const item = { expiry: daysFromNow(10), quantity: 5, costPerUnit: 50 };
    expect(priorityScore(item)).toBeGreaterThanOrEqual(0);
  });
});

describe('seedInventory', () => {
  it('generates the requested number of items', () => {
    const items = seedInventory(50);
    expect(items).toHaveLength(50);
  });

  it('every item has required fields', () => {
    const items = seedInventory(10);
    items.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('expiry');
      expect(item).toHaveProperty('costPerUnit');
    });
  });

  it('generates unique IDs', () => {
    const items = seedInventory(100);
    const ids = items.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  it('generates items across multiple categories', () => {
    const items = seedInventory(200);
    const cats = new Set(items.map((i) => i.category));
    expect(cats.size).toBeGreaterThan(3);
  });
});
