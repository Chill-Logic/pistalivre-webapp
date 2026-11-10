/** Currency of a cost. The cash is always in reais. */
export type Currency = "BRL" | "USD" | "EUR";
export type ForeignCurrency = Exclude<Currency, "BRL">;

/** How a company bill is paid (bookkeeping: the money leaves outside). */
export type ExpensePaymentMethod =
  | "PIX"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "AUTO_DEBIT"
  | "TRANSFER"
  | "CASH";

/** The rate a foreign amount was converted with (server math). */
export type Conversion = {
  currency: ForeignCurrency;
  /** Reais per 1 unit (selling). */
  rate: number;
  quotedAt: string;
  /** BCB_PTAX | AWESOMEAPI. */
  source: string;
  /** The card's IOF + spread (0 when not paid by card). */
  surchargePercent: number;
};

/** GET /exchange-rates/quote. */
export type ExchangeQuote = {
  currency: ForeignCurrency;
  amount: number;
  conversion: Conversion | null;
  /** null = no rate yet. */
  brl: number | null;
};
