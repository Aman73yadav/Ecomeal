import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";
import { btn, ghostBtn } from "../utils/styles.js";

export function StatusBar({ online, setOnline, queue, syncing, onSyncNow }) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
      <button
        onClick={() => setOnline((o) => !o)}
        title="Toggle simulated connectivity"
        style={{
          ...ghostBtn, display: "flex", alignItems: "center", gap: 6,
          color: online ? "var(--ok)" : "var(--crit)",
          borderColor: online ? "var(--ok)" : "var(--crit)",
        }}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online ? "Online" : "Offline"}
      </button>

      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Clock size={13} /> Queue: <b style={{ color: queue.length ? "var(--warn)" : "var(--ok)" }}>{queue.length}</b>
      </span>

      {syncing && (
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent2)" }}>
          <RefreshCw size={13} className="spin" /> syncing…
        </span>
      )}

      {online && queue.length > 0 && !syncing && (
        <button onClick={onSyncNow} style={btn("var(--accent2)")}>Sync now</button>
      )}
    </div>
  );
}
