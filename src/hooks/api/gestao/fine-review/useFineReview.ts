import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { toApiError } from "@/helpers/api-error";
import { fineReviewService } from "@/services/api/gestao/fine-review.service";
import { formatCurrency } from "@/utils/format";

export function useFineReview() {
  return useQuery({
    queryKey: queryKeys.finance.fineReview(),
    queryFn: fineReviewService.list,
    staleTime: 60_000,
  });
}

/** After any fix: the list, the Financeiro cards and the rentals' charges move. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all }),
    ]);
}

export function useAdjustFine() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (paymentId: string) => fineReviewService.adjust(paymentId),
    onSuccess: () => toast.success("Multa ajustada para a regra (no Asaas também)"),
    onError: (error) => toast.error(toApiError(error).message),
    onSettled: refresh,
  });
}

export function useDiscountFine() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (paymentId: string) => fineReviewService.discount(paymentId),
    onSuccess: (r) =>
      toast.success(
        r.status === "APPLIED"
          ? `Desconto de ${formatCurrency(r.amount)} aplicado na próxima cobrança`
          : `Desconto de ${formatCurrency(r.amount)} vai na próxima cobrança, quando ela for emitida`,
      ),
    onError: (error) => toast.error(toApiError(error).message),
    onSettled: refresh,
  });
}

/**
 * Every discount the card offers, one after another (several can lower the
 * same next charge, so never in parallel). Stops at the first error.
 */
export function useDiscountAllFines() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (paymentIds: string[]) => {
      let total = 0;
      for (const id of paymentIds) total += (await fineReviewService.discount(id)).amount;
      return { count: paymentIds.length, total };
    },
    onSuccess: (r) =>
      toast.success(
        `${r.count} descontos dados, ${formatCurrency(r.total)} no total, na próxima cobrança de cada locação`,
      ),
    onError: (error) => toast.error(toApiError(error).message),
    onSettled: refresh,
  });
}
