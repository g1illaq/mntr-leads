import { login } from "./actions";
import { Logo } from "@/components/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 bg-surface p-6 shadow-sm dark:border-white/10"
      >
        <Logo className="text-xl" />
        {error && (
          <p className="text-sm text-status-critical">Неверный пароль</p>
        )}
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          required
          autoFocus
          className="w-full rounded-md border border-black/10 bg-background px-3 py-2 text-sm text-foreground dark:border-white/10"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Войти
        </button>
      </form>
    </main>
  );
}
