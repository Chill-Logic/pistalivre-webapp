import type { CardPaymentOptionsValue } from "@/types/card-payment-options";

/**
 * A new card charge: at once only, card fees on the customer; the
 * anticipation only when the company is going to anticipate that sale.
 */
export const DEFAULT_CARD_PAYMENT_OPTIONS: CardPaymentOptionsValue = {
  installments: false,
  passFees: true,
  passInstallmentFee: true,
  passAnticipation: false,
};
