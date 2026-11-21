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
