import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { SEV_META } from "../constants/index.js";
import { severityOf, priorityScore } from "../utils/inventory.js";
import { Card } from "./ui/Card.jsx";

function Badge({ color, text }) {
  return (
    <span style={{ color, border: `1px solid ${color}`, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
      {text}
    </span>
  );
}

export function ExpiryAlerts({ items }) {
  const ranked = useMemo(
    () =>
      items
        .filter((it) => it.expiry != null && ["expired", "critical", "warning"].includes(severityOf(it)))
        .map((it) => ({ ...it, score: priorityScore(it) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8),
    [items]
  );

  return (
    <Card title="Expiry Alerts (smart-prioritized)" icon={<AlertTriangle size={16} />}>
      <div aria-live="polite" aria-label="Expiry alerts">
        {ranked.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 12 }}>Nothing urgent.</p>
        ) : (
          ranked.map((it) => {
            const sev = severityOf(it);
            return (
              <div key={it.id} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>{it.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>
                    {it.quantity} {it.unit} · ₹{(it.quantity * it.costPerUnit).toFixed(0)} at risk
                  </div>
                </div>
                <div className="text-right">
                  <Badge color={SEV_META[sev].color} text={SEV_META[sev].label} />
                  <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 3 }}>score {it.score}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
