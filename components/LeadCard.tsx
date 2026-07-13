import { deleteLead } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { PaymentPanel } from "@/components/PaymentPanel";
import { StatusSelect } from "@/components/StatusSelect";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Lead, Payment } from "@/lib/generated/prisma";

export function LeadCard({
  lead,
}: {
  lead: Lead & { payments: Payment[] };
}) {
  const paidInLeadCurrency = lead.payments
    .filter((p) => p.currency === lead.currency)
    .reduce((sum, p) => sum + p.amount, 0);
  const paidFraction =
    lead.amount > 0 ? Math.min(paidInLeadCurrency / lead.amount, 1) : 0;
  const initial = lead.clientName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-surface shadow-sm dark:border-white/10">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <StatusSelect
            leadId={lead.id}
            status={lead.status}
            rejectionReason={lead.rejectionReason}
          />
          <form action={deleteLead.bind(null, lead.id)}>
            <ConfirmSubmitButton
              confirmMessage={`Удалить заявку «${lead.clientName}»? Это действие необратимо.`}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-status-critical/10 hover:text-status-critical"
            >
              ✕
            </ConfirmSubmitButton>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/5 text-sm font-semibold text-foreground dark:bg-white/10">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">
              {lead.clientName}
            </div>
            <div className="truncate text-xs text-ink-muted">
              {lead.dealNumber && <>№{lead.dealNumber} · </>}
              {lead.product}
            </div>
          </div>
        </div>

        {lead.status === "REJECTED" && lead.rejectionReason && (
          <div className="rounded-lg bg-status-critical/10 px-3 py-1.5 text-xs text-status-critical">
            Причина: {lead.rejectionReason}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-muted">
              Сумма
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {formatMoney(lead.amount, lead.currency)}
            </div>
            {paidInLeadCurrency > 0 && (
              <div className="mt-1.5 w-32">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${paidFraction >= 1 ? "bg-status-good" : "bg-accent"}`}
                    style={{ width: `${paidFraction * 100}%` }}
                  />
                </div>
                <div className="mt-0.5 text-[11px] text-ink-secondary">
                  {formatMoney(paidInLeadCurrency, lead.currency)} из{" "}
                  {formatMoney(lead.amount, lead.currency)}
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-ink-muted">
              Спецпредложение
            </div>
            <DeadlineBadge deadline={lead.offerDeadline?.toISOString() ?? null} />
          </div>
        </div>
      </div>

      <details className="group border-t border-black/10 dark:border-white/10">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-2.5 text-xs font-medium text-ink-secondary hover:text-foreground">
          Подробнее
          <span className="text-ink-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="space-y-3 px-5 pb-4">
          <div className="text-xs text-ink-secondary">
            {[lead.email, lead.phone].filter(Boolean).join(" · ") ||
              "Без контактов"}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-secondary">
            <span>Создано: {formatDateTime(lead.createdAt)}</span>
            {lead.getcourseUrl && (
              <a
                href={lead.getcourseUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                открыть в GetCourse
              </a>
            )}
          </div>

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
