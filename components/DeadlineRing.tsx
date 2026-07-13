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

const SIZE = 40;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DeadlineRing({
  createdAt,
  deadline,
}: {
  createdAt: string;
  deadline: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) {
    return <span className="text-sm text-ink-muted">—</span>;
  }

  const start = new Date(createdAt).getTime();
  const end = new Date(deadline).getTime();
  const remaining = end - now;
  const hoursLeft = remaining / 3_600_000;
  const totalDuration = Math.max(end - start, 1);
  const fraction = Math.min(Math.max(remaining / totalDuration, 0), 1);

  const color =
    remaining <= 0
      ? "text-ink-muted"
      : hoursLeft < 6
        ? "text-status-critical"
        : hoursLeft < 24
          ? "text-status-warning"
          : "text-accent";

  return (
    <div className="flex items-center gap-2.5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 shrink-0">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-black/10 dark:stroke-white/10"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={`${color} stroke-current transition-[stroke-dashoffset]`}
        />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className={`text-xs font-semibold tabular-nums ${color}`}>
          {formatRemaining(remaining)}
        </span>
        <span className="text-xs text-ink-secondary">
          до {formatShortDateTime(deadline)}
        </span>
      </div>
    </div>
  );
}
