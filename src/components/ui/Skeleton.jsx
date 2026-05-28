export function Skeleton({ h = 40 }) {
  return (
    <div
      className="shimmer"
      style={{ height: h, borderRadius: 8, background: "var(--card)", marginBottom: 6 }}
    />
  );
}
