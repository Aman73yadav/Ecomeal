# Ecomeal — AI-Powered Offline-First Restaurant Dashboard

A production-grade restaurant inventory management system that works reliably under unstable internet, handles 1000+ items smoothly, and uses AI to reduce food waste.

**Live Demo:** _(deploy link here)_  
**GitHub:** _(repo link here)_

---

## Quick Start

```bash
npm install
npm run dev
```

Login: `manager@ecomeal.app` / `demo1234`

---

## Architecture Decisions

### Folder Structure

```text
src/
├── constants/        # THEMES, CATEGORIES, SEV_META — single source of truth
├── utils/
│   ├── api.js        # Mock server, flaky API simulation, retry, BroadcastChannel factory
│   ├── inventory.js  # Pure functions: seed data, severityOf, priorityScore, daysToExpiry
│   └── styles.js     # Shared style objects + globalCss
├── hooks/
│   ├── useOfflineQueue.js   # Queue state, drain logic, auto-sync
│   └── useBroadcastSync.js  # Cross-tab BroadcastChannel setup
└── components/
    ├── ui/           # Generic: Card, Skeleton
    ├── Login.jsx
    ├── StatusBar.jsx
    ├── InventoryTable.jsx   # Virtualized (custom windowing)
    ├── ExpiryAlerts.jsx
    ├── AIPanel.jsx
    ├── Analytics.jsx
    ├── AddItemModal.jsx
    └── ErrorBoundary.jsx
```

`App.jsx` is a thin orchestrator (~180 lines) — it wires state and passes props. All logic lives in hooks and utils.

---

## State Management Choice

**Plain React (useState + useCallback + custom hooks)** — no Zustand, Redux, or Context.

**Why:** The app has two main slices of state — inventory items and the offline mutation queue. Both flow top-down from App.jsx. A global store would add indirection without benefit at this scope. The offline queue is encapsulated in `useOfflineQueue`, and cross-tab sync is in `useBroadcastSync`, keeping concerns separated without a third-party library.

**Tradeoff:** If this scaled to 5+ feature modules with deeply nested state, Context or Zustand would make sense. For this scope, custom hooks are lighter and easier to test.

---

## Offline-First Strategy

### How it works

1. **Optimistic updates** — Every mutation (adjust qty, delete, add) updates local React state immediately. The user sees instant feedback.
2. **Mutation queue** — The same mutation is pushed to a queue (`useOfflineQueue`). Each entry has a unique `_id`.
3. **Drain loop** — When `online === true`, `drainQueue()` processes the queue FIFO, calling `api.pushMutation()` with exponential backoff retry (300ms → 600ms → 1200ms).
4. **Single-flight guard** — `drainingRef` prevents two concurrent drain loops.
5. **Ref mirroring** — `queueRef` and `onlineRef` mirror React state for use inside the async drain loop, avoiding stale closures.
6. **Cross-tab sync** — `BroadcastChannel("ecomeal-sync")` posts `ITEMS_UPDATED` on every mutation. Other open tabs apply it instantly.
7. **Service Worker** — `public/sw.js` uses stale-while-revalidate for the app shell. The app loads from cache when offline. API calls bypass SW cache so live data always hits the network.

### Assumption

The "server" is simulated in-memory. In production: IndexedDB for offline item storage + REST/WebSocket API for sync.

---

## AI Integration Logic

`AIPanel` calls Claude API (`claude-sonnet-4-6`) to generate 3 profit-maximizing dish recommendations from ingredients currently marked expired, critical, or warning.

**Prompt design:**

- Ingredients deduplicated, capped at 8 to keep the prompt tight
- Instructs the model to return strict JSON array (no markdown, no preamble)
- Response stripped of accidental code fences before `JSON.parse`

**Resilience:**

- Wrapped in `retry()` with 3 attempts and exponential backoff
- Shows informative message when offline instead of failing silently
- Skeleton loaders during generation; error state if all retries fail

---

## Performance Optimizations

| Technique | Where | Impact |
| --- | --- | --- |
| Custom virtual scrolling | `InventoryTable` | ~25 DOM rows rendered from 1100+ items. No external lib (saves bundle size) |
| `useMemo` filter + sort | `App.jsx` | 1100-item sort runs only when query/category/sortKey changes |
| `useMemo` analytics data | `Analytics.jsx` | Chart data recalculates only when item count changes |
| `useMemo` ingredients | `AIPanel.jsx` | Ingredient list recalculates only when expiring items change |
| 200ms debounced search | `App.jsx` | Prevents sort on every keystroke |
| `useCallback` on handlers | Throughout | Prevents unnecessary re-renders of memoized children |
| Single-flight drain | `useOfflineQueue` | `drainingRef` ensures only one queue drain runs at a time |

---

## Edge Cases Handled

**API failures:** `withFlakiness()` simulates 18–25% random failure rate + up to 700ms latency. `retry()` with exponential backoff handles transient failures. `ErrorBoundary` catches any uncaught render errors. Load errors surface a retry button.

**Null/incomplete data:** Rows with `null` quantity or expiry are repaired on load (`quantity → 0`, `expiry → +30d`) so the UI never crashes on bad server responses.

**Large datasets:** 1100 items at startup. Virtual scrolling keeps DOM at ~25 nodes regardless of list size.

**Cross-tab consistency:** Two browser tabs stay in sync via BroadcastChannel without a shared backend.

---

## Assumptions Made

1. **Auth is demo-only** — No real backend. In production: JWT, PKCE OAuth, or Clerk.
2. **Persistence is localStorage + in-memory** — Production would use IndexedDB offline + a real database.
3. **AI endpoint is proxied** — `/api/anthropic/v1/messages` is a proxy. In production this protects the API key server-side.
4. **Waste trend is simulated** — Real data would come from POS events. Chart currently randomizes values seeded by item count.
5. **Single user** — No multi-tenant or role-based access control.

---

## Bonus Features

- **PWA** — `manifest.json` + service worker with stale-while-revalidate. Installable on desktop/mobile.
- **Dark / Light mode** — CSS variable theming, persisted to localStorage.
- **Skeleton loaders** — Shimmer animation on initial load and AI generation.
- **Keyboard shortcuts** — `⌘/Ctrl+K` → focus search, `1` → Inventory, `2` → Analytics.
- **Optimistic updates** — Instant local state before server confirmation.
- **Background sync** — Queue drains automatically when connectivity is restored.
- **Retry with backoff** — All API calls retry up to 4× with exponential backoff.
- **Accessibility** — ARIA labels on all icon buttons, `role="dialog"` + focus trap on modal, `aria-live` on expiry alerts.

---

## Future Improvements

- Replace in-memory server with IndexedDB + real REST/WebSocket backend
- TypeScript for type safety across the data layer
- Vitest unit tests for `severityOf`, `priorityScore`, `useOfflineQueue`
- Replace Tailwind CDN with PostCSS build to eliminate runtime parsing overhead
- Service Worker background sync tag (`SyncEvent`) for reliable queue drain on mobile
- Role-based access: manager vs. kitchen staff views
- Push notifications for critical expiry alerts
