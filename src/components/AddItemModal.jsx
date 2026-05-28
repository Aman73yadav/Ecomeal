import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CATEGORIES, UNITS } from "../constants/index.js";
import { daysFromNow } from "../utils/inventory.js";
import { btn, ghostBtn, lbl, inp } from "../utils/styles.js";

export function AddItemModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "", category: CATEGORIES[0], quantity: "",
    unit: UNITS[0], expiry: daysFromNow(7), costPerUnit: "",
  });
  const [err, setErr] = useState("");
  const dialogRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) { setErr("Name is required."); return; }
    if (!form.quantity || isNaN(+form.quantity) || +form.quantity <= 0) { setErr("Enter a valid quantity."); return; }
    if (!form.costPerUnit || isNaN(+form.costPerUnit) || +form.costPerUnit <= 0) { setErr("Enter a valid cost per unit."); return; }
    onAdd({
      id: `INV-${Date.now()}`, name: form.name.trim(), category: form.category,
      quantity: +form.quantity, unit: form.unit, expiry: form.expiry,
      costPerUnit: +form.costPerUnit,
    });
    onClose();
  };

  // Focus first input on open; trap focus; close on Escape.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll("input, select, button, textarea, [tabindex]");
    focusable[0]?.focus();
    const trap = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={dialogRef} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 420 }}>
        <div className="flex items-center justify-between mb-4">
          <span id="modal-title" style={{ color: "var(--text)", fontWeight: 700, fontSize: 16 }}>Add New Item</span>
          <button onClick={onClose} style={{ ...ghostBtn, padding: 6 }} aria-label="Close dialog"><X size={16} /></button>
        </div>

        {[
          { label: "Item Name", key: "name", type: "text", placeholder: "e.g. Tomatoes" },
          { label: "Quantity", key: "quantity", type: "number", placeholder: "e.g. 10" },
          { label: "Cost per Unit (₹)", key: "costPerUnit", type: "number", placeholder: "e.g. 120" },
          { label: "Expiry Date", key: "expiry", type: "date" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label style={lbl}>{label}</label>
            <input type={type} value={form[key]} placeholder={placeholder}
              onChange={(e) => set(key, e.target.value)} style={{ ...inp, width: "100%" }} />
          </div>
        ))}

        <label style={lbl}>Category</label>
        <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...inp, width: "100%" }}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <label style={lbl}>Unit</label>
        <select value={form.unit} onChange={(e) => set("unit", e.target.value)} style={{ ...inp, width: "100%" }}>
          {UNITS.map((u) => <option key={u}>{u}</option>)}
        </select>

        {err && <p style={{ color: "var(--crit)", fontSize: 12, marginTop: 8 }}>{err}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button onClick={submit} style={{ ...btn("var(--accent)"), flex: 1 }}>Add Item</button>
        </div>
      </div>
    </div>
  );
}
