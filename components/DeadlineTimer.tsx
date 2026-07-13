"use client";

import { useEffect, useState } from "react";

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

  const tone =
    remaining <= 0
      ? "text-ink-muted"
      : hoursLeft < 6
        ? "text-status-critical"
        : hoursLeft < 24
          ? "text-status-warning"
          : "text-ink-secondary";

  return (
    <span className={`text-sm font-medium tabular-nums ${tone}`}>
      {formatRemaining(remaining)}
    </span>
  );
}
