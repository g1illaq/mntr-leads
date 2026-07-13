import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadsBoard } from "@/components/LeadsBoard";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/login/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const leads = await prisma.lead.findMany({
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center gap-4">
        <Logo />
        <h1 className="flex-1 text-sm font-medium uppercase tracking-wide text-ink-muted">
          Заявки на курс
        </h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-ink-muted hover:text-foreground"
          >
            Выйти
          </button>
        </form>
      </header>

      <AddLeadForm />

      <LeadsBoard leads={leads} />
    </main>
  );
}
