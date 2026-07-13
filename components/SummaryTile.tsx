export function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warning";
}) {
  const toneClass =
    tone === "good" ? "text-status-good" : "text-status-warning";

  return (
    <div className="rounded-xl border border-black/10 bg-surface p-5 shadow-sm dark:border-white/10">
      <div className="text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}
