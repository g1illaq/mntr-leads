import type { Currency } from "@/lib/generated/prisma";

export const USD_TO_RUB_RATE = 80;

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === "USD" && to === "RUB") return amount * USD_TO_RUB_RATE;
  if (from === "RUB" && to === "USD") return amount / USD_TO_RUB_RATE;
  return amount;
}
