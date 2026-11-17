import type { CardPaymentOptionsValue } from "@/types/card-payment-options";

/** A new card charge: at once only, every fee on the customer. */
export const DEFAULT_CARD_PAYMENT_OPTIONS: CardPaymentOptionsValue = {
  installments: false,
  passFees: true,
  passInstallmentFee: true,
  passAnticipation: true,
};
