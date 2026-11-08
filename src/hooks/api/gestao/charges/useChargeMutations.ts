import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { chargesService } from "@/services/api/gestao/charges.service";
import type {
  CautionChargesInput,
  ChargeBatchResult,
  ChargeSettleInput,
  ChargeSettlementInput,
  ChargeUpdateInput,
  InstallmentChargesInput,
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

/** "2 cobranças emitidas · 1 já existia" (what a batch did). */
function batchToast(result: ChargeBatchResult) {
  const created = result.created.length;
  const skipped = result.skipped?.length ?? 0;
  const parts = [
    `${created} ${created === 1 ? "cobrança emitida" : "cobranças emitidas"}`,
    skipped > 0 &&
      `${skipped} ${skipped === 1 ? "já existia" : "já existiam"} (pulada${skipped === 1 ? "" : "s"})`,
  ].filter(Boolean);
  if (result.failed?.length) toast.warning(parts.join(" · "));
  else toast.success(parts.join(" · "));
}

/** Deposit charges from the plan (dates as edited). 207 keeps the failures. */
export function useCreateCautionCharges(rentalId: string) {
  const refresh = useRefreshAfterCharge();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, key }: { input: CautionChargesInput; key: string }) =>
      chargesService.createCaution(rentalId, input, key),
    onSuccess: (result) => {
      refresh(rentalId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.rentals.cautionPlan(rentalId),
      });
      batchToast(result);
    },
  });
}

export function useCreateInstallmentCharges(rentalId: string) {
  const refresh = useRefreshAfterCharge();
  return useMutation({
    mutationFn: ({
      input,
      key,
    }: {
      input: InstallmentChargesInput;
      key: string;
    }) => chargesService.createInstallments(rentalId, input, key),
    onSuccess: (result) => {
      refresh(rentalId);
      batchToast(result);
    },
  });
}
