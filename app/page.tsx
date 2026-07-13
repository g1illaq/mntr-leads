import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadsBoard } from "@/components/LeadsBoard";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const leads = await prisma.lead.findMany({
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <Logo size={40} />
        <div>
          <h1 className="text-xl font-semibold leading-none text-foreground">
            mntr <span className="text-accent">заявки</span>
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
