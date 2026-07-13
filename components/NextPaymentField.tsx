"use client";

import { updateNextPaymentDueAt } from "@/app/actions";

function toDateValue(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function NextPaymentField({
  leadId,
  nextPaymentDueAt,
}: {
  leadId: string;
  nextPaymentDueAt: Date | string | null;
}) {
  const action = updateNextPaymentDueAt.bind(null, leadId);

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        type="date"
        name="nextPaymentDueAt"
        defaultValue={toDateValue(nextPaymentDueAt)}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-black/10 bg-surface px-2 py-1 text-xs text-foreground dark:border-white/10"
      />
    </form>
  );
}
