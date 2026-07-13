import { createLead } from "@/app/actions";

const inputClass =
  "w-full rounded-md border border-black/10 bg-surface px-2.5 py-1.5 text-sm text-foreground dark:border-white/10";
const labelClass = "flex flex-col gap-1 text-xs text-ink-secondary";

export function AddLeadForm() {
  return (
    <details className="rounded-xl border border-black/10 bg-surface shadow-sm dark:border-white/10">
      <summary className="cursor-pointer list-none p-4 text-sm font-medium text-accent">
        + Добавить заявку вручную
      </summary>

      <form action={createLead} className="grid gap-3 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>
          Клиент *
          <input name="clientName" required className={inputClass} placeholder="Имя клиента" />
        </label>
        <label className={labelClass}>
          Продукт *
          <input name="product" required className={inputClass} placeholder="Тариф Премиум" />
        </label>
        <div className="flex gap-2">
          <label className={`${labelClass} flex-1`}>
            Сумма *
            <input name="amount" required inputMode="decimal" className={inputClass} placeholder="16800" />
          </label>
          <label className={labelClass}>
            Валюта
            <select name="currency" defaultValue="RUB" className={inputClass}>
              <option value="RUB">₽ RUB</option>
              <option value="USD">$ USD</option>
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Email
          <input name="email" type="email" className={inputClass} placeholder="client@mail.com" />
        </label>
        <label className={labelClass}>
          Телефон
          <input name="phone" className={inputClass} placeholder="79640660066" />
        </label>
        <label className={labelClass}>
          № сделки (GetCourse)
          <input name="dealNumber" className={inputClass} placeholder="864722196" />
        </label>
        <label className={`${labelClass} sm:col-span-2 lg:col-span-2`}>
          Ссылка на сделку в GetCourse
          <input name="getcourseUrl" type="url" className={inputClass} placeholder="https://..." />
        </label>
        <label className={labelClass}>
          <span className="flex items-center gap-2 normal-case">
            <input type="checkbox" name="noDeadline" className="rounded" />
            Без дедлайна спецпредложения
          </span>
        </label>
        <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>
          Заметка
          <textarea name="notes" rows={2} className={inputClass} placeholder="Контекст по заявке" />
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Сохранить заявку
          </button>
        </div>
      </form>
    </details>
  );
}
