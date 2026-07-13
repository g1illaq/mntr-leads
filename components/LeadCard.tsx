import { deleteLead, updateLeadCreatedAt } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { PaymentPanel } from "@/components/PaymentPanel";
import { StatusSelect } from "@/components/StatusSelect";
import { formatMoney, toDatetimeLocalValue } from "@/lib/format";
import { convert } from "@/lib/currency";
import type { Lead, Payment } from "@/lib/generated/prisma";

export function LeadCard({
  lead,
}: {
  lead: Lead & { payments: Payment[] };
}) {
  const totalPaid = lead.payments.reduce(
    (sum, p) => sum + convert(p.amount, p.currency, lead.currency),
    0,
  );
  const paidFraction =
    lead.amount > 0 ? Math.min(totalPaid / lead.amount, 1) : 0;
  const initial = lead.clientName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-surface shadow-sm dark:border-white/10">
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-sm font-semibold text-foreground dark:bg-white/10">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-foreground">
            {lead.clientName}
          </div>
          <div className="truncate text-xs text-ink-muted">
            {lead.dealNumber && <>№{lead.dealNumber} · </>}
            {lead.product}
          </div>
        </div>
        <form action={deleteLead.bind(null, lead.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Удалить заявку «${lead.clientName}»? Это действие необратимо.`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-status-critical/10 hover:text-status-critical"
          >
            ✕
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 px-4 py-3 dark:border-white/10">
        <div>
          <div className="text-xl font-bold tabular-nums text-foreground">
            {formatMoney(lead.amount, lead.currency)}
          </div>
          {totalPaid > 0 && (
            <div className="mt-1.5 w-28">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${paidFraction >= 1 ? "bg-status-good" : "bg-accent"}`}
                  style={{ width: `${paidFraction * 100}%` }}
                />
              </div>
              <div className="mt-0.5 text-[11px] text-ink-secondary">
                {formatMoney(totalPaid, lead.currency)} из{" "}
                {formatMoney(lead.amount, lead.currency)}
              </div>
            </div>
          )}
        </div>
        <StatusSelect
          leadId={lead.id}
          status={lead.status}
          rejectionReason={lead.rejectionReason}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 px-4 py-2.5 dark:border-white/10">
        <span className="text-[11px] uppercase tracking-wide text-ink-muted">
          Спецпредложение
        </span>
        <DeadlineBadge deadline={lead.offerDeadline?.toISOString() ?? null} />
      </div>

      <details className="group mt-auto border-t border-black/10 dark:border-white/10">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-xs font-medium text-ink-secondary hover:text-foreground">
          Подробнее
          <span className="text-ink-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="space-y-3 px-4 pb-4">
          {lead.status === "REJECTED" && lead.rejectionReason && (
            <div className="rounded-lg bg-status-critical/10 px-3 py-1.5 text-xs text-status-critical">
              Причина отказа: {lead.rejectionReason}
            </div>
          )}

          <div className="text-xs text-ink-secondary">
            {[lead.email, lead.phone].filter(Boolean).join(" · ") ||
              "Без контактов"}
          </div>
          <form
            action={updateLeadCreatedAt.bind(null, lead.id)}
            className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary"
          >
            <label htmlFor={`createdAt-${lead.id}`}>Создано:</label>
            <input
              id={`createdAt-${lead.id}`}
              type="datetime-local"
              name="createdAt"
              defaultValue={toDatetimeLocalValue(lead.createdAt)}
              className="rounded-md border border-black/10 bg-surface px-2 py-1 text-xs text-foreground dark:border-white/10"
            />
            <button type="submit" className="text-accent hover:underline">
              Сохранить
            </button>
          </form>
          {lead.getcourseUrl && (
            <a
              href={lead.getcourseUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-accent hover:underline"
            >
              открыть в GetCourse
            </a>
          )}

          {lead.notes && (
            <p className="rounded-md bg-background/60 p-2 text-sm text-ink-secondary">
              {lead.notes}
            </p>
          )}
        </div>

        <PaymentPanel
          leadId={lead.id}
          amount={lead.amount}
          currency={lead.currency}
          payments={lead.payments}
        />
      </details>
    </div>
  );
}
