/** How the card of a charge works in the payment link. */
export type CardPaymentOptionsValue = {
  /** Installments offered (otherwise card at once only). */
  installments: boolean;
  /** The card fee goes to the customer. */
  passFees: boolean;
  /** With passFees: what the installment band charges above the at-once one. */
  passInstallmentFee: boolean;
  /** With passFees: the anticipation fee (Configurações › Juros do cartão). */
  passAnticipation: boolean;
};
