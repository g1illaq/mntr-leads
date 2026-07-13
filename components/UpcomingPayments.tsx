import { formatMoney } from "@/lib/format";
import { convert } from "@/lib/currency";
import type { Lead, Payment } from "@/lib/generated/prisma";

type LeadWithPayments = Lead & { payments: Payment[] };

function formatDueDate(date: Date | null) {
  if (!date) return "дата не указана";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(due);

  if (diffDays < 0) return `просрочено · ${formatted}`;
  if (diffDays === 0) return `сегодня`;
  if (diffDays === 1) return `завтра`;
  return formatted;
}

export function UpcomingPayments({ leads }: { leads: LeadWithPayments[] }) {
  const partial = leads.filter((l) => l.status === "PARTIALLY_PAID");
  if (partial.length === 0) return null;

  const sorted = [...partial].sort((a, b) => {
    const da = a.nextPaymentDueAt ? new Date(a.nextPaymentDueAt).getTime() : Infinity;
    const db = b.nextPaymentDueAt ? new Date(b.nextPaymentDueAt).getTime() : Infinity;
    return da - db;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-status-serious/30 bg-surface shadow-sm">
      <div className="flex items-center gap-2 bg-status-serious/10 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-status-serious">
          Ожидается доплата
        </span>
        <span className="rounded-full bg-status-serious/20 px-1.5 py-0.5 text-[11px] font-semibold text-status-serious">
          {partial.length}
        </span>
      </div>

      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {sorted.map((lead) => {
          const totalPaid = lead.payments.reduce(
            (sum, p) => sum + convert(p.amount, p.currency, lead.currency),
            0,
          );
          const remaining = Math.max(lead.amount - totalPaid, 0);
          const overdue =
            !!lead.nextPaymentDueAt && new Date(lead.nextPaymentDueAt) < new Date();
          const initial = lead.clientName.trim().charAt(0).toUpperCase() || "?";

          return (
            <li key={lead.id}>
              <a
                href={`#lead-${lead.id}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/5 text-xs font-semibold text-foreground dark:bg-white/10">
                  {initial}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {lead.clientName}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatMoney(remaining, lead.currency)}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    overdue
                      ? "bg-status-critical/15 text-status-critical"
                      : "bg-black/5 text-ink-secondary dark:bg-white/10"
                  }`}
                >
                  {formatDueDate(lead.nextPaymentDueAt)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
