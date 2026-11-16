import type { CardInstallmentOption } from "@/types/payment-link";

/** One band of the card interest table (installments from/to, inclusive). */
export type CardFeeBand = {
  from: number;
  to: number;
  /** % added (gross-up so the net is the balance). */
  percent: number;
  /** R$ added per installment. */
  fixedPerInstallment: number;
};

/** Anticipation built into the interest (% a month); 0 = not built in. */
export type CardAnticipation = {
  /** Card paid at once. */
  single: number;
  /** Card in installments. */
  installments: number;
};

/** GET/PUT /settings/card-fees. */
export type CardFeeSettings = {
  bands: CardFeeBand[];
  anticipation: CardAnticipation;
  /** Nobody changed it: the default (Dalila's) rates. */
  isDefault: boolean;
  /** The table applied to an example amount, computed by the server. */
  example: { amount: number; options: CardInstallmentOption[] };
};
