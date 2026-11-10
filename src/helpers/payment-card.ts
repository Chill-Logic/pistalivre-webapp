import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type { ExpensePaymentMethod } from "@/types/currency";
import type { PaymentCard, PaymentCardRef } from "@/types/payment-card";

/** Methods that go through a registered card. */
export function usesCard(method: ExpensePaymentMethod | null | undefined) {
  return method === "CREDIT_CARD" || method === "DEBIT_CARD";
}

/**
 * Select options for the cards: the active ones, plus `keepId` when it was
 * inactivated since (a saved choice never vanishes from its own field).
 */
export function paymentCardOptions(cards: PaymentCard[], keepId?: string | null) {
  return cards
    .filter((card) => card.active || card.id === keepId)
    .map((card) => ({
      value: card.id,
      label: [
        card.label,
        card.holder ? card.holder.name : null,
        !card.active ? "inativo" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }));
}

/**
 * "Cartão de crédito · Nubank PJ •••• 1234 · Fulano" (the holder only when it
 * isn't the company's), or null when not told.
 */
export function paymentText(
  paid: { paymentMethod: ExpensePaymentMethod | null; paymentCard: PaymentCardRef | null },
  label: (map: LabelMapName, code: string) => string,
) {
  if (!paid.paymentMethod) return null;
  return [
    label(LABEL_MAPS.expensePaymentMethod, paid.paymentMethod),
    paid.paymentCard?.label,
    paid.paymentCard?.holderName,
  ]
    .filter(Boolean)
    .join(" · ");
}
