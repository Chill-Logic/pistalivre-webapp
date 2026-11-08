import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { rentalBillingKey } from "@/helpers/billing";
import { billingService } from "@/services/api/gestao/billing.service";
import type {
  AutoBillingInput,
  RateSegmentInput,
  RentalBilling,
  RentCreditInput,
  RentReceiptInput,
  WaivedDayInput,
} from "@/types/billing";

/**
 * Every rule write answers the billing view: it goes straight into the
 * cache (no refetch). Filtered views refetch; the charges, the rental and
 * the totals too, since a rule can issue or settle charges.
 */
function useApplyBilling(rentalId: string) {
  const queryClient = useQueryClient();
  return (billing: RentalBilling) => {
    queryClient.setQueryData(rentalBillingKey(rentalId, null), billing);
    const prefix = rentalBillingKey(rentalId, null).slice(0, 3);
    queryClient.invalidateQueries({
      predicate: (query) =>
        prefix.every((part, index) => query.queryKey[index] === part) &&
        query.queryKey[3] !== null,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.rentals.charges(rentalId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.rentals.detail(rentalId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}

/** Errors stay with the dialog (fields, or a rule's message). */
export function useSetAutoBilling(rentalId: string) {
  const apply = useApplyBilling(rentalId);
  return useMutation({
    mutationFn: ({ input, key }: { input: AutoBillingInput; key: string }) =>
      billingService.setAutoBilling(rentalId, input, key),
    onSuccess: (result, { input }) => {
      apply(result.billing);
      if (!input.enabled) {
        toast.success("Cobranças automáticas desativadas");
      } else if (result.firstChargeError) {
        toast.warning(
          `Cobranças automáticas ativadas, mas a primeira cobrança não saiu: ${result.firstChargeError}. Emita-a pela lista de cobranças.`,
        );
      } else {
        toast.success(
          result.firstCharge
            ? "Cobranças automáticas ativadas e a primeira cobrança emitida"
            : "Cobranças automáticas ativadas",
        );
      }
    },
  });
}

export function useAddRateSegment(rentalId: string) {
  const apply = useApplyBilling(rentalId);
  return useMutation({
    mutationFn: ({ input, key }: { input: RateSegmentInput; key: string }) =>
      billingService.addRateSegment(rentalId, input, key),
    onSuccess: ({ billing, billed }) => {
      apply(billing);
      toast.success(
        billed > 0
          ? `Valores alterados. ${billed === 1 ? "1 cobrança de acerto saiu" : `${billed} cobranças de acerto saíram`} agora.`
          : "Valores alterados",
      );
    },
  });
}

/** Writes that answer the view directly. */
function useBillingWrite<TInput>(
  rentalId: string,
  write: (input: TInput) => Promise<RentalBilling>,
  success: string,
) {
  const apply = useApplyBilling(rentalId);
  return useMutation({
    mutationFn: write,
    onSuccess: (billing) => {
      apply(billing);
      toast.success(success);
    },
  });
}

export function useRemoveLastRateSegment(rentalId: string) {
  return useBillingWrite<void>(
    rentalId,
    () => billingService.removeLastRateSegment(rentalId),
    "Valor desfeito",
  );
}

export function useSetSkipWeekdays(rentalId: string) {
  return useBillingWrite<number[]>(
    rentalId,
    (weekdays) => billingService.setSkipWeekdays(rentalId, weekdays),
    "Dias sem cobrança atualizados",
  );
}

export function useAddWaivedDay(rentalId: string) {
  return useBillingWrite<WaivedDayInput>(
    rentalId,
    (input) => billingService.addWaivedDay(rentalId, input),
    "Dia abonado",
  );
}

export function useRemoveWaivedDay(rentalId: string) {
  return useBillingWrite<string>(
    rentalId,
    (date) => billingService.removeWaivedDay(rentalId, date),
    "Abono desfeito",
  );
}

export function useAddRentCredit(rentalId: string) {
  return useBillingWrite<RentCreditInput>(
    rentalId,
    (input) => billingService.addRentCredit(rentalId, input),
    "Desconto registrado",
  );
}

export function useRemoveRentCredit(rentalId: string) {
  return useBillingWrite<string>(
    rentalId,
    (creditId) => billingService.removeRentCredit(rentalId, creditId),
    "Desconto desfeito",
  );
}

export function useSetReconcileFrom(rentalId: string) {
  return useBillingWrite<string | null>(
    rentalId,
    (from) => billingService.setReconcileFrom(rentalId, from),
    "Início da conta atualizado",
  );
}

export function useAddRentReceipt(rentalId: string) {
  const apply = useApplyBilling(rentalId);
  return useMutation({
    mutationFn: ({ input, key }: { input: RentReceiptInput; key: string }) =>
      billingService.addRentReceipt(rentalId, input, key),
    onSuccess: (billing) => {
      apply(billing);
      toast.success("Pix registrado");
    },
  });
}

export function useRemoveRentReceipt(rentalId: string) {
  return useBillingWrite<string>(
    rentalId,
    (receiptId) => billingService.removeRentReceipt(rentalId, receiptId),
    "Pix excluído",
  );
}
