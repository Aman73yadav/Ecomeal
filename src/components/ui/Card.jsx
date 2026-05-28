export function Card({ title, icon, children }) {
  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>{title}
      </div>
      {children}
    </div>
  );
}
