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

/** The account's card fees at Asaas (read live). */
export type ProviderCardFees = {
  /** Valid today (with the promotion, when there is one). */
  bands: CardFeeBand[];
  /** Without the promotion (what comes after it). */
  regularBands: CardFeeBand[];
  /** yyyy-mm-dd: last day of the promotion; null = none. */
  promoUntil: string | null;
  anticipation: CardAnticipation;
};

/** GET/PUT /settings/card-fees. */
export type CardFeeSettings = {
  bands: CardFeeBand[];
  anticipation: CardAnticipation;
  /** Asaas's own fees (null = Asaas did not answer). */
  asaas: ProviderCardFees | null;
  /** Nobody changed it: the default (Dalila's) rates. */
  isDefault: boolean;
  /** The table applied to an example amount, computed by the server. */
  example: { amount: number; options: CardInstallmentOption[] };
};
