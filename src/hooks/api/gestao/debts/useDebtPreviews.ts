import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useDebouncedValue } from "@/hooks/ui/useDebouncedValue";
import { debtsService } from "@/services/api/gestao/debts.service";
import type { DebtPaymentPreviewInput, DebtPreviewInput } from "@/types/debt";

/**
 * Debounces by the body's JSON: the caller builds a new object every render,
 * and a string compares by value (no render loop, no refetch for the same).
 */
function useDebouncedBody<T>(input: T | null) {
  const body = useDebouncedValue(input == null ? null : JSON.stringify(input));
  return body;
}

/**
 * Interest/plan preview of the debt form, by the server (the front never
 * does the math). `input` null = the minimum isn't filled in yet; typing is
 * debounced, and the last answer stays while the next one comes.
 */
export function useDebtPreview(input: DebtPreviewInput | null) {
  const body = useDebouncedBody(input);
  return useQuery({
    queryKey: [...queryKeys.debts.all, "preview", body],
    queryFn: () =>
      debtsService.preview(JSON.parse(body ?? "{}") as DebtPreviewInput),
    enabled: body != null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** "Fica faltando X" of a payment being typed (server side, debounced). */
export function useDebtPaymentPreview(
  debtId: string,
  input: DebtPaymentPreviewInput | null,
) {
  const body = useDebouncedBody(input);
  return useQuery({
    queryKey: [...queryKeys.debts.all, "payment-preview", debtId, body],
    queryFn: () =>
      debtsService.previewPayment(
        debtId,
        JSON.parse(body ?? "{}") as DebtPaymentPreviewInput,
      ),
    enabled: body != null,
    placeholderData: keepPreviousData,
  });
}
