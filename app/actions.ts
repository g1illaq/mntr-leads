"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Currency, LeadStatus } from "@/lib/generated/prisma";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function parseAmount(raw: FormDataEntryValue | null): number {
  const value = Number(String(raw ?? "").replace(",", "."));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Некорректная сумма");
  }
  return value;
}

export async function createLead(formData: FormData) {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim();
  if (!clientName || !product) {
    throw new Error("Клиент и продукт обязательны");
  }

  const amount = parseAmount(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "RUB") as Currency;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const dealNumber = String(formData.get("dealNumber") ?? "").trim() || null;
  const getcourseUrl = String(formData.get("getcourseUrl") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const noDeadline = formData.get("noDeadline") === "on";

  await prisma.lead.create({
    data: {
      clientName,
      product,
      amount,
      currency,
      email,
      phone,
      dealNumber,
      getcourseUrl,
      notes,
      offerDeadline: noDeadline ? null : new Date(Date.now() + THREE_DAYS_MS),
    },
  });

  revalidatePath("/");
}

export async function setLeadStatus(leadId: string, formData: FormData) {
  const status = String(formData.get("status")) as LeadStatus;
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();

  if (status === "REJECTED" && !rejectionReason) {
    throw new Error("Нужно указать причину отказа");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason : null,
    },
  });
  revalidatePath("/");
}

export async function deleteLead(leadId: string) {
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/");
}

export async function addPayment(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const amount = parseAmount(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "RUB") as Currency;
  const note = String(formData.get("note") ?? "").trim() || null;

  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: { payments: true },
  });

  await prisma.payment.create({
    data: { leadId, amount, currency, note },
  });

  const paidInLeadCurrency =
    lead.payments
      .filter((p) => p.currency === lead.currency)
      .reduce((sum, p) => sum + p.amount, 0) +
    (currency === lead.currency ? amount : 0);

  const nextStatus: LeadStatus =
    paidInLeadCurrency >= lead.amount ? "PAID" : "PARTIALLY_PAID";

  if (lead.status !== "REJECTED") {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: nextStatus },
    });
  }

  revalidatePath("/");
}

export async function deletePayment(paymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { lead: { include: { payments: true } } },
  });

  await prisma.payment.delete({ where: { id: paymentId } });

  const remaining = payment.lead.payments.filter((p) => p.id !== paymentId);
  const paidInLeadCurrency = remaining
    .filter((p) => p.currency === payment.lead.currency)
    .reduce((sum, p) => sum + p.amount, 0);

  if (payment.lead.status !== "REJECTED") {
    const nextStatus: LeadStatus =
      paidInLeadCurrency <= 0
        ? "CONTACTED"
        : paidInLeadCurrency >= payment.lead.amount
          ? "PAID"
          : "PARTIALLY_PAID";
    await prisma.lead.update({
      where: { id: payment.leadId },
      data: { status: nextStatus },
    });
  }

  revalidatePath("/");
}
