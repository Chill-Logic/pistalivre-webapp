import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { chargesService } from "@/services/api/gestao/charges.service";
import type {
  ChargeSettleInput,
  ChargeSettlementInput,
  ChargeUpdateInput,
  RentalChargeInput,
} from "@/types/charge";

/**
 * After any charge write: the rental's list, the totals of the Financeiro
 * and the Painel (to collect, delinquency) and the customer record.
 */
function useRefreshAfterCharge() {
  const queryClient = useQueryClient();
  return (rentalId: string | null | undefined) => {
    if (rentalId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rentals.charges(rentalId),
      });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  };
}

/** Errors stay with the dialog (DUPLICATE_RENT, 422 fields, Asaas). */
export function useCreateRentalCharge(rentalId: string) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: ({ input, key }: { input: RentalChargeInput; key: string }) =>
      chargesService.createForRental(rentalId, input, key),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Cobrança emitida");
    },
  });
}

export function useUpdateCharge(id: string, rentalId: string | null) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: (input: ChargeUpdateInput) => chargesService.update(id, input),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Cobrança atualizada");
    },
  });
}

export function useDeleteCharge(id: string, rentalId: string | null) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: () => chargesService.remove(id),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Cobrança excluída");
    },
  });
}

export function useSettleCharge(id: string, rentalId: string | null) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: ({ input, key }: { input: ChargeSettleInput; key: string }) =>
      chargesService.settle(id, input, key),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Baixa registrada");
    },
  });
}

export function useCorrectSettlement(id: string, rentalId: string | null) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: (input: ChargeSettlementInput) =>
      chargesService.correctSettlement(id, input),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Recebimento corrigido");
    },
  });
}

export function useChargeReferenceDate(id: string, rentalId: string | null) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: (referenceDate: string | null) =>
      chargesService.setReferenceDate(id, referenceDate),
    onSuccess: () => {
      refresh(rentalId);
      toast.success("Referência atualizada");
    },
  });
}
