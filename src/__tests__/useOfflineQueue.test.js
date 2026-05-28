import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineQueue } from '../hooks/useOfflineQueue.js';

// Mock the api module so tests don't make real network calls
vi.mock('../utils/api.js', () => ({
  api: {
    pushMutation: vi.fn(() => Promise.resolve({ ok: true })),
  },
  retry: vi.fn((fn) => fn()),
  makeChannel: vi.fn(() => null),
}));

describe('useOfflineQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with an empty queue', () => {
    const { result } = renderHook(() => useOfflineQueue(true));
    expect(result.current.queue).toHaveLength(0);
  });

  it('enqueue adds a mutation to the queue', () => {
    const { result } = renderHook(() => useOfflineQueue(false)); // offline so drain doesn't run
    act(() => {
      result.current.enqueue({ type: 'DELETE', id: 'INV-001' });
    });
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].type).toBe('DELETE');
  });

  it('enqueue assigns a unique _id to each mutation', () => {
    const { result } = renderHook(() => useOfflineQueue(false));
    act(() => {
      result.current.enqueue({ type: 'DELETE', id: 'INV-001' });
      result.current.enqueue({ type: 'DELETE', id: 'INV-002' });
    });
    const [a, b] = result.current.queue;
    expect(a._id).not.toBe(b._id);
  });

  it('queue accumulates multiple mutations while offline', () => {
    const { result } = renderHook(() => useOfflineQueue(false));
    act(() => {
      result.current.enqueue({ type: 'ADJUST_QTY', id: 'INV-001', delta: 1 });
      result.current.enqueue({ type: 'ADJUST_QTY', id: 'INV-002', delta: -1 });
      result.current.enqueue({ type: 'ADD', item: { id: 'INV-999' } });
    });
    expect(result.current.queue).toHaveLength(3);
  });

  it('syncing starts as false', () => {
    const { result } = renderHook(() => useOfflineQueue(false));
    expect(result.current.syncing).toBe(false);
  });
});
