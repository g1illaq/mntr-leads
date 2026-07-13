"use client";

import { useMemo, useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { StatTile } from "@/components/StatTile";
import { SummaryTile } from "@/components/SummaryTile";
import { formatMoney } from "@/lib/format";
import type { Currency, Lead, LeadStatus, Payment } from "@/lib/generated/prisma";

type LeadWithPayments = Lead & { payments: Payment[] };

type FilterKey =
  | "ALL"
  | "NO_CONTACT"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "NEXT_COHORT"
  | "REJECTED";

const STATUS_PRIORITY: Record<LeadStatus, number> = {
  NEW: 0,
  NO_CONTACT: 1,
  CONTACTED: 2,
  PARTIALLY_PAID: 3,
  PAID: 4,
  NEXT_COHORT: 5,
  REJECTED: 6,
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

function matchesQuery(lead: LeadWithPayments, query: string) {
  const haystack = [
    lead.clientName,
    lead.dealNumber,
    lead.product,
    lead.email,
    lead.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function LeadsBoard({ leads }: { leads: LeadWithPayments[] }) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (byStatus !== 0) return byStatus;
        const da = a.offerDeadline ? new Date(a.offerDeadline).getTime() : Infinity;
        const db = b.offerDeadline ? new Date(b.offerDeadline).getTime() : Infinity;
        return da - db;
      }),
    [leads],
  );

  const unpaid = sorted.filter(
    (l) => l.status === "NEW" || l.status === "NO_CONTACT" || l.status === "CONTACTED",
  );
  const noContact = sorted.filter((l) => l.status === "NO_CONTACT");
  const partial = sorted.filter((l) => l.status === "PARTIALLY_PAID");
  const paid = sorted.filter((l) => l.status === "PAID");
  const nextCohort = sorted.filter((l) => l.status === "NEXT_COHORT");
  const rejected = sorted.filter((l) => l.status === "REJECTED");

  const receivedSums = sumByCurrency(
    sorted.flatMap((l) => l.payments.map((p) => ({ amount: p.amount, currency: p.currency }))),
  );
  const outstandingSums = sumByCurrency(
    sorted
      .filter((l) => l.status !== "REJECTED")
      .map((l) => {
        const paidInLeadCurrency = l.payments
          .filter((p) => p.currency === l.currency)
          .reduce((sum, p) => sum + p.amount, 0);
        return {
          amount: Math.max(l.amount - paidInLeadCurrency, 0),
          currency: l.currency,
        };
      }),
  );

  const byFilter =
    filter === "NO_CONTACT"
      ? noContact
      : filter === "UNPAID"
        ? unpaid
        : filter === "PARTIALLY_PAID"
          ? partial
          : filter === "PAID"
            ? paid
            : filter === "NEXT_COHORT"
              ? nextCohort
              : filter === "REJECTED"
                ? rejected
                : sorted;

  const trimmedQuery = query.trim().toLowerCase();
  const visible = trimmedQuery
    ? byFilter.filter((lead) => matchesQuery(lead, trimmedQuery))
    : byFilter;

  function toggle(key: FilterKey) {
    setFilter((current) => (current === key ? "ALL" : key));
  }

  return (
    <div className="space-y-6">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени, номеру сделки, тарифу, email или телефону…"
        className="w-full rounded-xl border border-black/10 bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-ink-muted dark:border-white/10"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryTile
          label="Оплачено всего"
          value={formatSums(receivedSums)}
          tone="good"
        />
        <SummaryTile
          label="Не оплачено всего"
          value={formatSums(outstandingSums)}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatTile
          label="Всего заявок"
          value={String(sorted.length)}
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
        />
        <StatTile
          label="Не удалось связаться"
          value={String(noContact.length)}
          tone="serious"
          active={filter === "NO_CONTACT"}
          onClick={() => toggle("NO_CONTACT")}
        />
        <StatTile
          label="Не оплачено"
          value={String(unpaid.length)}
          tone="warning"
          active={filter === "UNPAID"}
          onClick={() => toggle("UNPAID")}
        />
        <StatTile
          label="Частично оплачено"
          value={String(partial.length)}
          tone="serious"
          active={filter === "PARTIALLY_PAID"}
          onClick={() => toggle("PARTIALLY_PAID")}
        />
        <StatTile
          label="Оплачено"
          value={String(paid.length)}
          tone="good"
          active={filter === "PAID"}
          onClick={() => toggle("PAID")}
        />
        <StatTile
          label="Перенос на след. поток"
          value={String(nextCohort.length)}
          active={filter === "NEXT_COHORT"}
          onClick={() => toggle("NEXT_COHORT")}
        />
        <StatTile
          label="Отказ"
          value={String(rejected.length)}
          tone="critical"
          active={filter === "REJECTED"}
          onClick={() => toggle("REJECTED")}
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-ink-muted dark:border-white/10">
          {sorted.length === 0
            ? "Заявок пока нет — добавьте первую вручную."
            : trimmedQuery
              ? "Ничего не найдено по этому запросу."
              : "Нет заявок с этим статусом."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
