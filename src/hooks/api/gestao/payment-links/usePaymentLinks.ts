import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { errorMessage } from "@/helpers/api-error";
import { paymentLinksService } from "@/services/api/gestao/payment-links.service";

/** The rental's payment links + the preview of a new one (balance, charges to group). */
export function useRentalPaymentLinks(rentalId: string) {
  return useQuery({
    queryKey: queryKeys.rentals.paymentLinks(rentalId),
    queryFn: () => paymentLinksService.listByRental(rentalId),
  });
}

/** A link groups charges and moves the balance: the whole rental refreshes. */
function useRefreshRental() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

export function useCreatePaymentLink(rentalId: string) {
  const refresh = useRefreshRental();
  return useMutation({
    mutationFn: ({
      amount,
      acceptsCard,
      cardInstallments,
      key,
    }: {
      amount: number | null;
      acceptsCard: boolean;
      cardInstallments: boolean;
      key: string;
    }) =>
      paymentLinksService.create(
        rentalId,
        { amount, acceptsCard, cardInstallments },
        key,
      ),
    onSettled: refresh,
  });
}

export function useRenewPaymentLink() {
  const refresh = useRefreshRental();
  return useMutation({
    mutationFn: paymentLinksService.renew,
    onSuccess: () => toast.success("Link renovado por mais 7 dias"),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: refresh,
  });
}

export function useCancelPaymentLink() {
  const refresh = useRefreshRental();
  return useMutation({
    mutationFn: paymentLinksService.cancel,
    onSuccess: () => toast.success("Link cancelado"),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: refresh,
  });
}
