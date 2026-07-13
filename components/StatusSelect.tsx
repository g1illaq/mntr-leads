"use client";

import { setLeadStatus } from "@/app/actions";
import type { LeadStatus } from "@/lib/generated/prisma";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  NO_CONTACT: "Не удалось связаться",
  CONTACTED: "Контакт установлен",
  PARTIALLY_PAID: "Оплата частями",
  PAID: "Оплачено",
  REJECTED: "Отказ",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-status-warning/15 text-status-warning border-status-warning/40",
  NO_CONTACT:
    "bg-status-serious/15 text-status-serious border-status-serious/40",
  CONTACTED: "bg-cat-aqua/15 text-cat-aqua border-cat-aqua/40",
  PARTIALLY_PAID: "bg-accent/15 text-accent border-accent/40",
  PAID: "bg-status-good/15 text-status-good border-status-good/40",
  REJECTED:
    "bg-status-critical/15 text-status-critical border-status-critical/40",
};

export function statusBadgeClass(status: LeadStatus) {
  return STATUS_COLORS[status];
}

export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const action = setLeadStatus.bind(null, leadId);
  return (
    <form action={action}>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
      >
        {(Object.entries(STATUS_LABELS) as [LeadStatus, string][]).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ),
        )}
      </select>
    </form>
  );
}
