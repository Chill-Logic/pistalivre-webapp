import type { PaymentLink, PaymentLinkState } from "@/types/payment-link";
import { formatCalendarDate, formatCurrency, formatDate } from "@/utils/format";

export const PAYMENT_LINK_STATE_LABEL: Record<PaymentLinkState, string> = {
  OPEN: "Aberto",
  EXPIRED: "Vencido",
  PAID: "Pago",
  CANCELED: "Cancelado",
};

export const PAYMENT_LINK_STATE_BADGE: Record<
  PaymentLinkState,
  "neutral" | "success" | "warning" | "outline"
> = {
  OPEN: "neutral",
  EXPIRED: "warning",
  PAID: "success",
  CANCELED: "outline",
};

/** "Pago no PIX em 18/11" / "Pago no cartão 3× (R$ 1.088,12) em 18/11". */
export function paymentLinkPaidLabel(link: PaymentLink) {
  if (link.state !== "PAID") return null;
  const when = link.paidAt ? ` em ${formatDate(link.paidAt)}` : "";
  if (link.paidMethod === "CREDIT_CARD") {
    const total = link.grossAmount ? ` (${formatCurrency(link.grossAmount)} no cartão)` : "";
    return `Pago no cartão ${link.installments ?? 1}×${total}${when}`;
  }
  return `Pago no PIX${when}`;
}

/** The message the staff sends with the link (WhatsApp, no customer data in it). */
export function paymentLinkMessage(link: PaymentLink) {
  return [
    `Olá! Segue o link para pagar o saldo da sua locação: ${formatCurrency(link.amount)}.`,
    "É só abrir o link e pagar.",
    link.expiresAt ? `O link vale até ${formatDate(link.expiresAt)}: ${link.url}` : link.url,
  ].join("\n");
}

export const whatsappShareUrl = (text: string) =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;

/** "20/10/2026 · R$ 60,00" for a grouped charge. */
export function groupedChargeLine(charge: { dueDate: string | null; amount: number }) {
  return `${charge.dueDate ? formatCalendarDate(charge.dueDate) : "sem data"} · ${formatCurrency(charge.amount)}`;
}
