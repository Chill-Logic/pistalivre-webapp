import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { documentsService } from "@/services/api/gestao/documents.service";
import { standaloneChargesService } from "@/services/api/gestao/standalone-charges.service";
import type {
  ManualChargeInput,
  StandaloneChargeInput,
} from "@/types/standalone-charge";

/**
 * A charge outside the rental card may land on any rental of the customer:
 * refresh every rental's charges, the Financeiro, the Painel and customers.
 */
function useRefreshEverywhere() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  };
}

/** Errors (422 by item, 502, NOT_RECORDED) stay with the dialog. */
export function useCreateStandaloneCharge() {
  const refresh = useRefreshEverywhere();
  return useMutation({
    mutationFn: ({
      input,
      key,
    }: {
      input: StandaloneChargeInput;
      key: string;
    }) => standaloneChargesService.create(input, key),
    onSuccess: (result) => {
      refresh();
      if (result.code === "PARTIAL") return; // the dialog lists what failed
      toast.success(
        result.created.length > 1
          ? `${result.created.length} cobranças emitidas`
          : "Cobrança emitida",
      );
    },
  });
}

type ManualVariables = {
  input: ManualChargeInput;
  key: string;
  receipts: File[];
};

/**
 * Records a payment received outside Asaas, then sends the receipts one by
 * one (the charge owns them). A failed receipt does not undo the record.
 */
export function useCreateManualCharge() {
  const refresh = useRefreshEverywhere();
  return useMutation({
    mutationFn: async ({ input, key, receipts }: ManualVariables) => {
      const charge = await standaloneChargesService.createManual(input, key);
      let failed = 0;
      for (const file of receipts) {
        try {
          await documentsService.upload(
            { type: "PAYMENT", id: charge.id },
            file,
          );
        } catch {
          failed += 1;
        }
      }
      return { charge, failed };
    },
    onSuccess: ({ charge, failed }) => {
      refresh();
      const what = charge.amounts.isPaid
        ? "Recebimento registrado"
        : "Cobrança registrada em aberto";
      if (failed > 0) {
        toast.warning(
          `${what}, mas ${failed === 1 ? "1 comprovante não subiu" : `${failed} comprovantes não subiram`}. Anexe de novo na cobrança.`,
        );
      } else {
        toast.success(what);
      }
    },
  });
}

/** Links an Asaas charge made outside the system (pay_…) to a rental. */
export function useLinkCharge() {
  const refresh = useRefreshEverywhere();
  return useMutation({
    mutationFn: ({
      chargeId,
      rentalId,
    }: {
      chargeId: string;
      rentalId: string;
    }) => standaloneChargesService.link(chargeId, rentalId),
    onSuccess: () => {
      refresh();
      toast.success(
        "Cobrança vinculada. Ela aparece na locação na próxima sincronização.",
      );
    },
  });
}
