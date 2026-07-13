export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warning" | "serious" | "critical";
}) {
  const toneClass =
    tone === "good"
      ? "text-status-good"
      : tone === "warning"
        ? "text-status-warning"
        : tone === "serious"
          ? "text-status-serious"
          : tone === "critical"
            ? "text-status-critical"
            : "text-foreground";

  return (
    <div className="rounded-xl border border-black/10 bg-surface p-4 shadow-sm dark:border-white/10">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-ink-secondary">{sub}</div>}
    </div>
  );
}
