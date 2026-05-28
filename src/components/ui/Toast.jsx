const TYPE_COLOR = {
  success: "var(--ok)",
  error: "var(--crit)",
  warning: "var(--warn)",
  info: "var(--accent2)",
};

const TYPE_ICON = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 2000,
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          style={{
            pointerEvents: "all",
            background: "var(--panel)",
            border: `1px solid ${TYPE_COLOR[t.type]}`,
            borderLeft: `4px solid ${TYPE_COLOR[t.type]}`,
            borderRadius: 10, padding: "10px 14px", fontSize: 13,
            color: "var(--text)", maxWidth: 300, minWidth: 220,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", gap: 10,
            animation: "toastIn 0.2s ease",
          }}
        >
          <span style={{ color: TYPE_COLOR[t.type], fontWeight: 700, fontSize: 15 }}>
            {TYPE_ICON[t.type]}
          </span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--muted)", fontSize: 18, padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
