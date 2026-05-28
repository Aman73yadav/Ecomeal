import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { btn } from "../utils/styles.js";
import { retry } from "../utils/api.js";
import { Card } from "./ui/Card.jsx";
import { Skeleton } from "./ui/Skeleton.jsx";

export function AIPanel({ expiringItems, online }) {
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [err, setErr] = useState("");

  const ingredientList = useMemo(
    () => [...new Set(expiringItems.map((i) => i.name))].slice(0, 8),
    [expiringItems]
  );

  const generate = async () => {
    if (!online) { setErr("AI needs connectivity. Recommendations are cached when offline."); return; }
    setLoading(true); setErr(""); setDishes([]);
    const prompt = `You are a chef AI for a restaurant. Using these ingredients that are nearing expiry: ${ingredientList.join(", ")}, generate exactly 3 restaurant dishes that maximize use of these ingredients and profit. Respond ONLY with a JSON array, no markdown, no preamble. Each element: {"name": string, "uses": string[], "why": string (one short sentence on profit/waste reduction)}.`;
    try {
      const res = await retry(() =>
        fetch("/api/anthropic/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        }).then((r) => r.json()),
        3
      );
      const text = res.content.filter((c) => c.type === "text").map((c) => c.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setDishes(JSON.parse(clean));
    } catch (e) {
      setErr("Could not generate right now. " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI Chef Specials" icon={<Sparkles size={16} />}>
      <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
        Suggests profit-maximizing dishes from ingredients nearing expiry.
      </p>
      <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 10 }}>
        Using: {ingredientList.length ? ingredientList.join(", ") : "no expiring items 🎉"}
      </div>
      <button
        onClick={generate}
        disabled={loading || !ingredientList.length}
        style={{ ...btn("var(--accent)"), opacity: loading || !ingredientList.length ? 0.6 : 1 }}
      >
        {loading ? "Thinking…" : "Generate 3 dishes"}
      </button>
      {err && <p style={{ color: "var(--crit)", fontSize: 12, marginTop: 10 }}>{err}</p>}
      <div className="mt-3 space-y-2">
        {loading && [1, 2, 3].map((i) => <Skeleton key={i} h={56} />)}
        {dishes.map((d, i) => (
          <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
            <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{d.name}</div>
            <div style={{ color: "var(--accent2)", fontSize: 12, margin: "3px 0" }}>{(d.uses || []).join(" · ")}</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{d.why}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
