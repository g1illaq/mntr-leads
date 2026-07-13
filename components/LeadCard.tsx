import { deleteLead } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { DeadlineTimer } from "@/components/DeadlineTimer";
import { PaymentPanel } from "@/components/PaymentPanel";
import { StatusSelect } from "@/components/StatusSelect";
import { formatDateTime, formatMoney, formatShortDateTime } from "@/lib/format";
import type { Lead, Payment } from "@/lib/generated/prisma";

export function LeadCard({
  lead,
}: {
  lead: Lead & { payments: Payment[] };
}) {
  return (
    <details className="group rounded-xl border border-black/10 bg-surface shadow-sm dark:border-white/10">
      <summary className="grid cursor-pointer list-none grid-cols-1 gap-2 p-4 sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4">
        <StatusSelect leadId={lead.id} status={lead.status} />

        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">
            {lead.clientName}
            <span className="ml-2 text-sm font-normal text-ink-secondary">
              {lead.product}
            </span>
          </div>
          <div className="truncate text-xs text-ink-muted">
            {[lead.email, lead.phone].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>

        <div className="text-sm font-medium tabular-nums text-foreground">
          {formatMoney(lead.amount, lead.currency)}
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-ink-muted">
            спецпредложение
          </span>
          <DeadlineTimer deadline={lead.offerDeadline?.toISOString() ?? null} />
          {lead.offerDeadline && (
            <span className="text-[11px] text-ink-muted">
              {formatShortDateTime(lead.createdAt)} → {formatShortDateTime(lead.offerDeadline)}
            </span>
          )}
        </div>

        <form action={deleteLead.bind(null, lead.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Удалить заявку «${lead.clientName}»? Это действие необратимо.`}
            className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-status-critical/10 hover:text-status-critical"
          >
            ✕
          </ConfirmSubmitButton>
        </form>

        <span className="justify-self-end text-ink-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>

      <div className="space-y-3 px-4 pb-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-secondary">
          <span>Создано: {formatDateTime(lead.createdAt)}</span>
          {lead.dealNumber && <span>Сделка №{lead.dealNumber}</span>}
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
  );
}
