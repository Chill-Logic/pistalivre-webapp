import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { paymentCardsService } from "@/services/api/gestao/payment-cards.service";
import type { PaymentCardInput } from "@/types/payment-card";

/**
 * Create, edit and delete a card. Its name and surcharge show up (and convert)
 * in the fixed costs, the month's bills and the projection, so they refetch.
 */
export function usePaymentCardWrites() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all(
      [
        queryKeys.paymentCards.all,
        queryKeys.suppliers.all,
        queryKeys.expenses.all,
        queryKeys.exchangeRates.all,
        queryKeys.projections.all,
        queryKeys.dashboard.all,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: PaymentCardInput }) =>
      id ? paymentCardsService.update(id, input) : paymentCardsService.create(input),
    onSuccess: (_card, { id }) => {
      void refresh();
      toast.success(id ? "Cartão atualizado" : "Cartão cadastrado");
    },
  });
  const remove = useMutation({
    mutationFn: paymentCardsService.remove,
    onSuccess: () => {
      void refresh();
      toast.success("Cartão excluído");
    },
  });

  return { save, remove };
}
