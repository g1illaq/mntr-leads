export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warning" | "serious" | "critical";
  active?: boolean;
  onClick: () => void;
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
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-xl border bg-surface p-4 text-left shadow-sm transition hover:border-accent/50 ${
        active
          ? "border-accent ring-2 ring-accent"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="text-xs text-ink-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-ink-secondary">{sub}</div>}
    </button>
  );
}
