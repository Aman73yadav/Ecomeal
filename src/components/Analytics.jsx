import { useMemo } from "react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { tooltipStyle } from "../utils/styles.js";
import { severityOf, daysToExpiry } from "../utils/inventory.js";
import { Card } from "./ui/Card.jsx";

export function Analytics({ items }) {
  const wasteTrend = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      waste: Math.round(20 + Math.random() * 60),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length]
  );

  const expiryBuckets = useMemo(() => {
    const b = { Expired: 0, "≤1d": 0, "≤3d": 0, "≤7d": 0, "8d+": 0 };
    items.forEach((it) => {
      if (it.expiry == null) return;
      const d = daysToExpiry(it.expiry);
      if (d < 0) b.Expired++;
      else if (d <= 1) b["≤1d"]++;
      else if (d <= 3) b["≤3d"]++;
      else if (d <= 7) b["≤7d"]++;
      else b["8d+"]++;
    });
    return Object.entries(b).map(([name, value]) => ({ name, value }));
  }, [items]);

  const mostWasted = useMemo(() => {
    const m = {};
    items.filter((it) => severityOf(it) === "expired").forEach((it) => {
      m[it.name] = (m[it.name] || 0) + 1;
    });
    return Object.entries(m)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [items]);

  const healthPct = useMemo(() => {
    const good = items.filter((it) => ["ok", "soon"].includes(severityOf(it))).length;
    return items.length ? Math.round((good / items.length) * 100) : 0;
  }, [items]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <Card title="Inventory Health" icon={<CheckCircle2 size={16} />}>
        <div style={{ fontSize: 40, fontWeight: 800, color: healthPct > 70 ? "var(--ok)" : "var(--warn)" }}>
          {healthPct}%
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12 }}>items fresh / not yet critical</p>
      </Card>

      <Card title="Waste Trend (7d)" icon={<BarChart3 size={16} />}>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={wasteTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} />
            <YAxis stroke="var(--muted)" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="waste" stroke="var(--crit)" fill="var(--crit)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Expiry Distribution" icon={<Clock size={16} />}>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={expiryBuckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} />
            <YAxis stroke="var(--muted)" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Most Wasted Ingredients" icon={<Trash2 size={16} />}>
        {mostWasted.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 12 }}>No expired items.</p>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={mostWasted}>
              <XAxis type="number" stroke="var(--muted)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="var(--muted)" fontSize={11} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--crit)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
