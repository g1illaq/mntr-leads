import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadsBoard } from "@/components/LeadsBoard";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const leads = await prisma.lead.findMany({
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center gap-4">
        <Logo />
        <div>
          <h1 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            Заявки на курс
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Контроль оплат по спецпредложению — никого не терять в течение 3 дней.
          </p>
        </div>
      </header>

      <AddLeadForm />

      <LeadsBoard leads={leads} />
    </main>
  );
}
