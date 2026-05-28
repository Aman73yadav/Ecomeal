import { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { SEV_META, ROW_H, VIEWPORT_H } from "../constants/index.js";
import { severityOf, daysToExpiry } from "../utils/inventory.js";

function Badge({ color, text }) {
  return (
    <span style={{ color, border: `1px solid ${color}`, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
      {text}
    </span>
  );
}

function IconBtn({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: 4, cursor: "pointer", color: "var(--text)", display: "flex" }}
    >
      {children}
    </button>
  );
}

export function InventoryTable({ items, onAdjust, onDelete }) {
  const [scrollTop, setScrollTop] = useState(0);
  const total = items.length;
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 5);
  const visibleCount = Math.ceil(VIEWPORT_H / ROW_H) + 10;
  const end = Math.min(total, start + visibleCount);
  const slice = items.slice(start, end);

  const COL = "minmax(100px, 2fr) minmax(90px, 1.3fr) minmax(70px, 1fr) minmax(90px, 1.4fr) minmax(70px, 1fr) minmax(90px, 1.3fr)";
  const MIN_W = 580;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Horizontal scroll wrapper for narrow screens */}
      <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: MIN_W }}>
      <div
        className="text-xs font-semibold"
        style={{ display: "grid", gridTemplateColumns: COL, padding: "10px 14px", color: "var(--muted)", background: "var(--panel)", borderBottom: "1px solid var(--border)" }}
      >
        <span>Item</span><span>Category</span><span>Qty</span><span>Expiry</span><span>Status</span><span>Actions</span>
      </div>
      <div
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: VIEWPORT_H, overflowY: "auto", background: "var(--card)" }}
      >
        <div style={{ height: total * ROW_H, position: "relative" }}>
          <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
            {slice.map((it) => {
              const sev = severityOf(it);
              const dte = daysToExpiry(it.expiry);
              return (
                <div
                  key={it.id}
                  className="items-center text-xs"
                  style={{ display: "grid", gridTemplateColumns: COL, alignItems: "center", height: ROW_H, padding: "0 14px", borderBottom: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <span className="truncate" style={{ fontWeight: 500 }}>
                    {it.name} <span style={{ color: "var(--muted)" }}>· {it.id}</span>
                  </span>
                  <span style={{ color: "var(--muted)" }}>{it.category}</span>
                  <span>{it.quantity ?? "—"} {it.unit}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {it.expiry ?? "—"}
                    {it.expiry && <em style={{ color: SEV_META[sev].color, fontStyle: "normal" }}> ({dte}d)</em>}
                  </span>
                  <span><Badge color={SEV_META[sev].color} text={SEV_META[sev].label} /></span>
                  <span className="flex gap-1">
                    <IconBtn onClick={() => onAdjust(it.id, +1)} label={`Increase quantity of ${it.name}`}><Plus size={13} /></IconBtn>
                    <IconBtn onClick={() => onAdjust(it.id, -1)} label={`Decrease quantity of ${it.name}`}><Minus size={13} /></IconBtn>
                    <IconBtn onClick={() => onDelete(it.id)} label={`Delete ${it.name}`}><Trash2 size={13} /></IconBtn>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 14px", fontSize: 11, color: "var(--muted)", background: "var(--panel)", borderTop: "1px solid var(--border)" }}>
        Rendering rows {total ? start + 1 : 0}–{end} of {total} (windowed virtualization · DOM nodes ~{visibleCount})
      </div>
      </div>{/* minWidth wrapper */}
      </div>{/* overflowX scroll wrapper */}
    </div>
  );
}
