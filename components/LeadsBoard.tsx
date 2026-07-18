"use client";

import { useMemo, useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { MANAGER_LABELS } from "@/components/ManagerSelect";
import { StatTile } from "@/components/StatTile";
import { SummaryTile } from "@/components/SummaryTile";
import { UpcomingPayments } from "@/components/UpcomingPayments";
import { formatMoney } from "@/lib/format";
import { convert } from "@/lib/currency";
import type { Lead, LeadStatus, Manager, Payment } from "@/lib/generated/prisma";

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
  if (haystack.includes(query)) return true;

  const queryDigits = query.replace(/\D/g, "");
  if (queryDigits.length >= 4 && lead.phone) {
    if (lead.phone.replace(/\D/g, "").includes(queryDigits)) return true;
  }

  return false;
}

export function LeadsBoard({ leads }: { leads: LeadWithPayments[] }) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [managerFilter, setManagerFilter] = useState<Manager | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (byStatus !== 0) return byStatus;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [leads],
  );

  const managerFiltered =
    managerFilter === "ALL"
      ? sorted
      : sorted.filter((l) => l.manager === managerFilter);

  const unpaid = managerFiltered.filter(
    (l) => l.status === "NEW" || l.status === "NO_CONTACT" || l.status === "CONTACTED",
  );
  const noContact = managerFiltered.filter((l) => l.status === "NO_CONTACT");
  const partial = managerFiltered.filter((l) => l.status === "PARTIALLY_PAID");
  const paid = managerFiltered.filter((l) => l.status === "PAID");
  const nextCohort = managerFiltered.filter((l) => l.status === "NEXT_COHORT");
  const rejected = managerFiltered.filter((l) => l.status === "REJECTED");

  const totalReceived = managerFiltered.reduce(
    (sum, l) =>
      sum +
      l.payments.reduce((s, p) => s + convert(p.amount, p.currency, "RUB"), 0),
    0,
  );
  const totalOutstanding = managerFiltered
    .filter((l) => l.status !== "REJECTED")
    .reduce((sum, l) => {
      const totalPaid = l.payments.reduce(
        (s, p) => s + convert(p.amount, p.currency, l.currency),
        0,
      );
      const remaining = Math.max(l.amount - totalPaid, 0);
      return sum + convert(remaining, l.currency, "RUB");
    }, 0);

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
                : managerFiltered;

  const trimmedQuery = query.trim().toLowerCase();
  const visible = trimmedQuery
    ? managerFiltered.filter((lead) => matchesQuery(lead, trimmedQuery))
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-muted">Менеджер:</span>
        <button
          type="button"
          onClick={() => setManagerFilter("ALL")}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            managerFilter === "ALL"
              ? "border-accent bg-accent/15 text-accent"
              : "border-black/10 text-ink-secondary hover:border-accent/50 dark:border-white/10"
          }`}
        >
          Все
        </button>
        {(Object.entries(MANAGER_LABELS) as [Manager, string][]).map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setManagerFilter((current) => (current === value ? "ALL" : value))
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                managerFilter === value
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-black/10 text-ink-secondary hover:border-accent/50 dark:border-white/10"
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      <UpcomingPayments leads={managerFiltered} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryTile
          label="Оплачено всего"
          value={formatMoney(totalReceived, "RUB")}
          tone="good"
        />
        <SummaryTile
          label="Не оплачено всего"
          value={formatMoney(totalOutstanding, "RUB")}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatTile
          label="Всего заявок"
          value={String(managerFiltered.length)}
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
