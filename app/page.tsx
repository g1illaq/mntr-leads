import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadsBoard } from "@/components/LeadsBoard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const leads = await prisma.lead.findMany({
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Заявки на курс</h1>
        <p className="text-sm text-ink-secondary">
          Контроль оплат по спецпредложению — никого не терять в течение 3 дней.
        </p>
      </header>

      <AddLeadForm />

      <LeadsBoard leads={leads} />
    </main>
  );
}
