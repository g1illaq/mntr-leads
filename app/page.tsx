import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadCard } from "@/components/LeadCard";
import { StatTile } from "@/components/StatTile";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { Currency, LeadStatus } from "@/lib/generated/prisma";

const STATUS_PRIORITY: Record<LeadStatus, number> = {
  NEW: 0,
  NO_CONTACT: 1,
  CONTACTED: 2,
  PARTIALLY_PAID: 3,
  PAID: 4,
  REJECTED: 5,
};

function sumByCurrency(entries: { amount: number; currency: Currency }[]) {
  const sums: Partial<Record<Currency, number>> = {};
  for (const entry of entries) {
    sums[entry.currency] = (sums[entry.currency] ?? 0) + entry.amount;
  }
  return sums;
}

function formatSums(sums: Partial<Record<Currency, number>>) {
  const parts = (Object.entries(sums) as [Currency, number][])
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => formatMoney(amount, currency));
  return parts.length > 0 ? parts.join(" + ") : "—";
}

export default async function Home() {
  const leads = await prisma.lead.findMany({
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  leads.sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;
    const da = a.offerDeadline ? new Date(a.offerDeadline).getTime() : Infinity;
    const db = b.offerDeadline ? new Date(b.offerDeadline).getTime() : Infinity;
    return da - db;
  });

  const unpaid = leads.filter(
    (l) => l.status === "NEW" || l.status === "NO_CONTACT" || l.status === "CONTACTED",
  );
  const noContact = leads.filter((l) => l.status === "NO_CONTACT");
  const partial = leads.filter((l) => l.status === "PARTIALLY_PAID");
  const paid = leads.filter((l) => l.status === "PAID");
  const rejected = leads.filter((l) => l.status === "REJECTED");

  const atRiskSums = sumByCurrency(
    [...unpaid, ...partial].map((l) => ({ amount: l.amount, currency: l.currency })),
  );
  const receivedSums = sumByCurrency(
    leads.flatMap((l) => l.payments.map((p) => ({ amount: p.amount, currency: p.currency }))),
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Заявки на курс</h1>
        <p className="text-sm text-ink-secondary">
          Контроль оплат по спецпредложению — никого не терять в течение 3 дней.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Всего заявок" value={String(leads.length)} />
        <StatTile
          label="Не удалось связаться"
          value={String(noContact.length)}
          tone="serious"
        />
        <StatTile
          label="Не оплачено"
          value={String(unpaid.length)}
          sub={formatSums(atRiskSums)}
          tone="warning"
        />
        <StatTile
          label="Частично оплачено"
          value={String(partial.length)}
          tone="serious"
        />
        <StatTile
          label="Оплачено"
          value={String(paid.length)}
          sub={formatSums(receivedSums)}
          tone="good"
        />
        <StatTile label="Отказ" value={String(rejected.length)} tone="critical" />
      </div>

      <AddLeadForm />

      <div className="space-y-3">
        {leads.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-ink-muted dark:border-white/10">
            Заявок пока нет — добавьте первую вручную.
          </p>
        )}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </main>
  );
}
