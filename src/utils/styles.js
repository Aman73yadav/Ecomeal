export const btn = (bg) => ({
  background: bg, color: "#0d1117", border: "none", padding: "8px 14px",
  borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13,
});

export const ghostBtn = {
  background: "transparent", color: "var(--text)", border: "1px solid var(--border)",
  padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
};

export const lbl = {
  color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 5, marginTop: 12,
};

export const inp = {
  width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 14,
  background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", outline: "none",
};

export const tooltipStyle = {
  background: "var(--panel)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text)", fontSize: 12,
};

export const globalCss = `
  * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .shimmer { position: relative; overflow: hidden; }
  .shimmer::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: sh 1.3s infinite; }
  @keyframes sh { 100% { transform: translateX(100%); } }
  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 9px; }
  select { cursor: pointer; }
  @media (max-width: 768px) { .layout-grid { grid-template-columns: 1fr !important; } }
  @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
`;
