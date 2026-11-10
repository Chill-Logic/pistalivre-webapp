import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import {
  exchangeRatesService,
  type QuoteParams,
} from "@/services/api/gestao/exchange-rates.service";
import type { Currency } from "@/types/currency";

/**
 * Reais of a foreign amount today (rate + the card's surcharge), asked to the
 * server as the person types. Off for reais or an empty amount.
 */
export function useExchangeQuote(
  params: Omit<QuoteParams, "currency" | "amount"> & {
    currency: Currency;
    amount: number | null;
  },
) {
  // A string, so each render's new object doesn't restart the timer.
  const debounced = JSON.parse(
    useDebouncedValue(JSON.stringify(params), 400),
  ) as typeof params;
  const { currency, amount } = debounced;
  const enabled = currency !== "BRL" && amount !== null && amount > 0;
  return useQuery({
    queryKey: queryKeys.exchangeRates.quote({
      currency,
      amount,
      paymentMethod: debounced.paymentMethod,
      paymentCardId: debounced.paymentCardId,
    }),
    queryFn: () =>
      exchangeRatesService.quote({
        ...debounced,
        currency: currency as Exclude<Currency, "BRL">,
        amount: amount ?? 0,
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
