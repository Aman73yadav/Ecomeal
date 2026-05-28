import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Package, BarChart3, LogOut, Search, Sun, Moon, Plus, Menu } from "lucide-react";

import { THEMES, CATEGORIES } from "./constants/index.js";
import { api, retry } from "./utils/api.js";
import { daysFromNow, severityOf, priorityScore } from "./utils/inventory.js";
import { btn, ghostBtn, inp, globalCss } from "./utils/styles.js";
import { useOfflineQueue } from "./hooks/useOfflineQueue.js";
import { useBroadcastSync } from "./hooks/useBroadcastSync.js";
import { useToast } from "./hooks/useToast.js";

import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { Login } from "./components/Login.jsx";
import { StatusBar } from "./components/StatusBar.jsx";
import { InventoryTable } from "./components/InventoryTable.jsx";
import { ExpiryAlerts } from "./components/ExpiryAlerts.jsx";
import { AIPanel } from "./components/AIPanel.jsx";
import { Analytics } from "./components/Analytics.jsx";
import { AddItemModal } from "./components/AddItemModal.jsx";
import { Skeleton } from "./components/ui/Skeleton.jsx";
import { ToastContainer } from "./components/ui/Toast.jsx";

export default function App() {
  /* ---- theme (persisted) ---- */
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ecomeal_theme") || "dark"; } catch { return "dark"; }
  });
  const vars = THEMES[theme];

  /* ---- auth ---- */
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("ecomeal_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  /* ---- connectivity (simulated toggle) ---- */
  const [online, setOnline] = useState(true);

  /* ---- data ---- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ---- toasts ---- */
  const { toasts, toast, dismiss } = useToast();

  /* ---- offline queue hook ---- */
  const { queue, syncing, drainQueue, enqueue } = useOfflineQueue(online);

  /* ---- cross-tab broadcast hook ---- */
  const broadcast = useBroadcastSync(useCallback((remoteItems) => setItems(remoteItems), []));

  /* ---- ui state ---- */
  const [tab, setTab] = useState("inventory");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cat, setCat] = useState("All");
  const [sortKey, setSortKey] = useState("expiry");
  const [sidebar, setSidebar] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const searchRef = useRef(null);

  /* ---- load inventory ---- */
  const loadData = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const data = await retry(() => api.fetchInventory(), 4);
      const clean = data.filter((d) => d && d.id).map((d) => ({
        ...d,
        quantity: d.quantity == null ? 0 : d.quantity,
        expiry: d.expiry == null ? daysFromNow(30) : d.expiry,
        costPerUnit: d.costPerUnit ?? 0,
      }));
      setItems(clean);
    } catch {
      setLoadError("Failed to load inventory after retries. Showing cached/empty data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  /* ---- debounce search ---- */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  /* ---- apply mutation: optimistic update + broadcast + enqueue ---- */
  const applyMutation = useCallback((mutation) => {
    setItems((prev) => {
      let next = prev;
      if (mutation.type === "ADJUST_QTY")
        next = prev.map((x) => x.id === mutation.id ? { ...x, quantity: Math.max(0, +(x.quantity + mutation.delta).toFixed(1)) } : x);
      else if (mutation.type === "DELETE")
        next = prev.filter((x) => x.id !== mutation.id);
      else if (mutation.type === "ADD")
        next = [mutation.item, ...prev];
      broadcast(next);
      return next;
    });
    enqueue(mutation);
    if (mutation.type === "ADD") toast({ message: `"${mutation.item.name}" added to inventory`, type: "success" });
    if (mutation.type === "DELETE") toast({ message: "Item removed from inventory", type: "warning" });
  }, [broadcast, enqueue, toast]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "1") setTab("inventory");
      if (e.key === "2") setTab("analytics");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ---- derived: filter + sort ---- */
  const visible = useMemo(() => {
    let list = items;
    if (cat !== "All") list = list.filter((x) => x.category === cat);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter((x) => x.name.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortKey === "expiry") return new Date(a.expiry) - new Date(b.expiry);
      if (sortKey === "quantity") return b.quantity - a.quantity;
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "priority") return priorityScore(b) - priorityScore(a);
      return 0;
    });
  }, [items, cat, debounced, sortKey]);

  /* ---- toast on connectivity change ---- */
  const prevOnlineRef = useRef(online);
  useEffect(() => {
    if (prevOnlineRef.current === online) return;
    prevOnlineRef.current = online;
    if (!online) toast({ message: "You're offline — changes will sync when reconnected", type: "warning", duration: 4000 });
    else toast({ message: "Back online — syncing changes…", type: "info" });
  }, [online, toast]);

  /* ---- toast when sync queue clears ---- */
  const prevSyncingRef = useRef(false);
  useEffect(() => {
    if (prevSyncingRef.current && !syncing && queue.length === 0) {
      toast({ message: "All changes synced successfully", type: "success" });
    }
    prevSyncingRef.current = syncing;
  }, [syncing, queue.length, toast]);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem("ecomeal_user"); setUser(null); };
  const toggleTheme = () => setTheme((t) => {
    const n = t === "dark" ? "light" : "dark";
    try { localStorage.setItem("ecomeal_theme", n); } catch {}
    return n;
  });

  const NAV = [
    { id: "inventory", label: "Inventory", icon: <Package size={16} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  ];

  if (!user) {
    return <div style={vars}><style>{globalCss}</style><Login onLogin={handleLogin} /></div>;
  }

  return (
    <ErrorBoundary>
      <div style={{ ...vars, minHeight: "100vh", background: "var(--bg)" }}>
        <style>{globalCss}</style>

        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap" style={{ background: "var(--panel)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <button className="md:hidden" onClick={() => setSidebar((s) => !s)} style={{ ...ghostBtn, padding: 7 }} aria-label="Toggle navigation sidebar">
              <Menu size={16} />
            </button>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--accent)" }} className="flex items-center justify-center">
              <Package size={15} color="#0d1117" />
            </div>
            <b style={{ color: "var(--text)", fontSize: 15 }}>Ecomeal</b>
          </div>

          <StatusBar online={online} setOnline={setOnline} queue={queue} syncing={syncing} onSyncNow={drainQueue} />

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} style={{ ...ghostBtn, padding: 7 }} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <span style={{ color: "var(--muted)", fontSize: 12 }} className="hidden sm:inline">{user.email}</span>
            <button onClick={handleLogout} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5 }} aria-label="Log out">
              <LogOut size={14} /> Exit
            </button>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`${sidebar ? "block" : "hidden"} md:block`} style={{ width: 190, background: "var(--panel)", borderRight: "1px solid var(--border)", minHeight: "calc(100vh - 53px)", padding: 12 }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebar(false); }} className="flex items-center gap-2 w-full"
                style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 4, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  background: tab === n.id ? "var(--card)" : "transparent", color: tab === n.id ? "var(--accent)" : "var(--muted)" }}>
                {n.icon}{n.label}
              </button>
            ))}
            <div style={{ marginTop: 18, fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
              <b style={{ color: "var(--text)" }}>Shortcuts</b><br />⌘/Ctrl + K — search<br />1 — inventory<br />2 — analytics
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-4" style={{ minWidth: 0 }}>
            {loadError && (
              <div style={{ background: "var(--card)", border: "1px solid var(--crit)", color: "var(--crit)", padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
                {loadError} <button onClick={loadData} style={{ ...btn("var(--crit)"), marginLeft: 8 }}>Retry</button>
              </div>
            )}

            {tab === "inventory" && (
              <div className="layout-grid gap-4" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.3fr) minmax(0, 1fr)" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="flex gap-2 mb-3 flex-wrap items-center">
                    <div className="flex items-center gap-2 flex-1" style={{ ...inp, minWidth: 200, display: "flex", padding: "0 11px" }}>
                      <Search size={15} color="var(--muted)" />
                      <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search items…  (⌘K)" aria-label="Search inventory items"
                        style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", padding: "9px 0", width: "100%", fontSize: 14 }} />
                    </div>
                    <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...inp, width: "auto" }}>
                      {["All", ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ ...inp, width: "auto" }}>
                      <option value="expiry">Sort: Expiry</option>
                      <option value="priority">Sort: Priority</option>
                      <option value="quantity">Sort: Quantity</option>
                      <option value="name">Sort: Name</option>
                    </select>
                    <button onClick={() => setAddOpen(true)} style={{ ...btn("var(--accent)"), display: "flex", alignItems: "center", gap: 5 }}>
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  {loading
                    ? <div>{[...Array(8)].map((_, i) => <Skeleton key={i} h={40} />)}</div>
                    : <InventoryTable items={visible} onAdjust={(id, delta) => applyMutation({ type: "ADJUST_QTY", id, delta })} onDelete={(id) => applyMutation({ type: "DELETE", id })} />
                  }
                </div>

                <div className="space-y-4" style={{ minWidth: 0 }}>
                  <ExpiryAlerts items={items} />
                  <AIPanel expiringItems={items.filter((it) => ["expired", "critical", "warning"].includes(severityOf(it)))} online={online} />
                </div>
              </div>
            )}

            {tab === "analytics" && (loading ? <Skeleton h={300} /> : <Analytics items={items} />)}
          </main>
        </div>

        {addOpen && (
          <AddItemModal
            onClose={() => setAddOpen(false)}
            onAdd={(item) => applyMutation({ type: "ADD", item })}
          />
        )}

        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ErrorBoundary>
  );
}
