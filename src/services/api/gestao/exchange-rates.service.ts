import { http } from "@/services/http/client";
import type { ExchangeQuote, ExpensePaymentMethod, ForeignCurrency } from "@/types/currency";

export type QuoteParams = {
  currency: ForeignCurrency;
  amount: number;
  paymentMethod: ExpensePaymentMethod | null;
  paymentCardId: string | null;
};

/** Today's rate (+ the card's surcharge): the server does the math. */
export const exchangeRatesService = {
  async quote({ currency, amount, paymentMethod, paymentCardId }: QuoteParams) {
    const { data } = await http.get<ExchangeQuote>("/exchange-rates/quote", {
      params: {
        currency,
        amount,
        paymentMethod: paymentMethod ?? undefined,
        paymentCardId: paymentCardId ?? undefined,
      },
    });
    return data;
  },
};
