"use client";

import { updateLeadManager } from "@/app/actions";
import type { Manager } from "@/lib/generated/prisma";

export const MANAGER_LABELS: Record<Manager, string> = {
  AKHMAD: "Ахмад",
  SAFA: "Сафа",
  ASLAN: "Аслан",
};

export function ManagerSelect({
  leadId,
  manager,
}: {
  leadId: string;
  manager: Manager | null;
}) {
  const action = updateLeadManager.bind(null, leadId);

  return (
    <form action={action}>
      <select
        name="manager"
        defaultValue={manager ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="cursor-pointer rounded-md border border-black/10 bg-surface px-2 py-1 text-xs text-foreground dark:border-white/10"
      >
        <option value="">не назначен</option>
        {(Object.entries(MANAGER_LABELS) as [Manager, string][]).map(
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
