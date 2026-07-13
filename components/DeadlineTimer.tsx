"use client";

import { useEffect, useState } from "react";
import { formatShortDateTime } from "@/lib/format";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Истёк";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
}

export function DeadlineTimer({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) {
    return <span className="text-sm text-ink-muted">—</span>;
  }

  const remaining = new Date(deadline).getTime() - now;
  const hoursLeft = remaining / 3_600_000;

  const pillClass =
    remaining <= 0
      ? "bg-ink-muted/10 text-ink-muted border-ink-muted/30"
      : hoursLeft < 6
        ? "bg-status-critical/15 text-status-critical border-status-critical/40"
        : hoursLeft < 24
          ? "bg-status-warning/15 text-status-warning border-status-warning/40"
          : "bg-black/5 text-ink-secondary border-black/10 dark:bg-white/5 dark:border-white/10";

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${pillClass}`}
      >
        {formatRemaining(remaining)}
      </span>
      <span className="text-xs text-ink-secondary">
        до {formatShortDateTime(deadline)}
      </span>
    </div>
  );
}
