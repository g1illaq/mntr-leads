import { addPayment, deletePayment } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Currency, Payment } from "@/lib/generated/prisma";

export function PaymentPanel({
  leadId,
  amount,
  currency,
  payments,
}: {
  leadId: string;
  amount: number;
  currency: Currency;
  payments: Payment[];
}) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(amount - totalPaid, 0);

  return (
    <div className="space-y-4 border-t border-black/10 bg-background/50 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-ink-secondary">
          Оплачено: <span className="font-medium text-foreground">{formatMoney(totalPaid, currency)}</span>
        </span>
        <span className="text-ink-secondary">
          Остаток: <span className="font-medium text-foreground">{formatMoney(remaining, currency)}</span>
        </span>
      </div>

      {payments.length > 0 && (
        <ul className="space-y-1.5">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-foreground">
                {formatMoney(p.amount, p.currency)}
              </span>
              <span className="text-ink-muted">{formatDateTime(p.paidAt)}</span>
              {p.note && (
                <span className="flex-1 truncate text-ink-secondary">
                  {p.note}
                </span>
              )}
              <form action={deletePayment.bind(null, p.id)}>
                <ConfirmSubmitButton
                  confirmMessage="Удалить этот платёж?"
                  className="text-xs text-ink-muted hover:text-status-critical"
                >
                  удалить
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        action={addPayment}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="leadId" value={leadId} />
        <label className="flex flex-col gap-1 text-xs text-ink-secondary">
          Сумма
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            required
            placeholder="0"
            className="w-28 rounded-md border border-black/10 bg-surface px-2 py-1 text-sm text-foreground dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-secondary">
          Валюта
          <select
            name="currency"
            defaultValue={currency}
            className="rounded-md border border-black/10 bg-surface px-2 py-1 text-sm text-foreground dark:border-white/10"
          >
            <option value="RUB">₽ RUB</option>
            <option value="USD">$ USD</option>
          </select>
        </label>
        <label className="flex flex-1 min-w-32 flex-col gap-1 text-xs text-ink-secondary">
          Комментарий
          <input
            name="note"
            type="text"
            placeholder="напр. 1-й платёж"
            className="w-full rounded-md border border-black/10 bg-surface px-2 py-1 text-sm text-foreground dark:border-white/10"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          + Платёж
        </button>
      </form>
    </div>
  );
}
